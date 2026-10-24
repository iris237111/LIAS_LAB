package ma.lias.controller;

import ma.lias.dto.DecisionRequest;
import ma.lias.entity.*;
import ma.lias.repository.*;
import ma.lias.service.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/membership-requests")
public class MembershipRequestController {

    private final MembershipRequestRepository repo;
    private final UserRepository users;
    private final MemberRepository members;
    private final FileStorageService storage;
    private final EmailService email;
    private final PasswordEncoder encoder;
    private final AuditService audit;
    private final MandateService mandateService;  // ← AJOUT

    public MembershipRequestController(MembershipRequestRepository repo,
                                       UserRepository users,
                                       MemberRepository members,
                                       FileStorageService storage,
                                       EmailService email,
                                       PasswordEncoder encoder,
                                       AuditService audit,
                                       MandateService mandateService) {
        this.repo = repo;
        this.users = users;
        this.members = members;
        this.storage = storage;
        this.email = email;
        this.encoder = encoder;
        this.audit = audit;
        this.mandateService = mandateService;
    }

    // --------------------------------------------------------- //
    //  Soumission publique (sans authentification)               //
    // --------------------------------------------------------- //

    @GetMapping("/public/check")
    public ResponseEntity<Map<String, String>> checkEmail(@RequestParam String email) {
        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.ok(Map.of("status", "MEMBER"));
        }
        List<MembershipRequest> requests = repo.findAll().stream()
                .filter(r -> email.equalsIgnoreCase(r.getEmail()))
                .toList();
        if (requests.isEmpty()) return ResponseEntity.ok(Map.of("status", "NONE"));
        String latest = requests.stream()
                .map(r -> r.getStatus().name())
                .reduce((a, b) -> b).orElse("NONE");
        return ResponseEntity.ok(Map.of("status", latest));
    }

    @PostMapping("/public")
    public ResponseEntity<MembershipRequest> submit(
            @RequestParam String applicantName,
            @RequestParam String emailAddress,
            @RequestParam String motivation,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String requestedRole,
            @RequestParam(required = false) MultipartFile cv) throws Exception {

        if (users.findByEmail(emailAddress).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà associé à un compte existant.");
        }
        if (repo.existsByEmailAndStatus(emailAddress, MembershipRequestStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une demande avec cet email est déjà en attente de traitement.");
        }

        MembershipRequest r = new MembershipRequest();
        r.setApplicantName(applicantName);
        r.setEmail(emailAddress);
        r.setMotivation(motivation);
        if (password != null && !password.isBlank()) r.setPasswordHash(encoder.encode(password));
        if (requestedRole != null && !requestedRole.isBlank()) r.setRequestedRole(requestedRole);
        if (cv != null) r.setCvUrl(storage.save(cv, "cv"));

        MembershipRequest saved = repo.save(r);
        email.send(emailAddress, "Demande d'adhésion reçue",
                "Votre demande d'adhésion au laboratoire LIAS a bien été reçue. " +
                "Vous serez informé(e) de la décision par email.");
        audit.log("CREATE", "MembershipRequest", saved.getId(), "Demande publique soumise");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --------------------------------------------------------- //
    //  Consultation (directeur ou admin)                         //
    // --------------------------------------------------------- //

    @GetMapping
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public List<MembershipRequest> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public MembershipRequest one(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable."));
    }

    // --------------------------------------------------------- //
    //  Décision : ACCEPTÉE ou REFUSÉE                           //
    //  Règle métier : seul le directeur du mandat ACTIF peut    //
    //  prendre cette décision.                                   //
    // --------------------------------------------------------- //

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public MembershipRequest decision(@PathVariable Long id,
                                      @RequestBody DecisionRequest decision,
                                      Authentication auth) {

        User actor = (User) auth.getPrincipal();

        // Vérification mandat actif — lève 403 si l'utilisateur n'est pas
        // le directeur du mandat en cours (l'ADMIN passe toujours).
        boolean isAdmin = actor.getAppRole() == AppRole.ADMIN;
        if (!isAdmin) {
            mandateService.assertIsActiveDirector(actor);
        }

        MembershipRequest r = one(id);

        if (r.getStatus() != MembershipRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette demande a déjà été traitée (statut : " + r.getStatus() + ").");
        }

        r.setReviewedBy(actor.getId());
        r.setReviewedAt(LocalDateTime.now());
        r.setDecisionReason(decision.reason());

        if (decision.accepted()) {
            r.setStatus(MembershipRequestStatus.ACCEPTED);

            // Récupérer ou créer le compte utilisateur
            String hash = r.getPasswordHash() != null
                    ? r.getPasswordHash()
                    : encoder.encode("Lias" + (System.currentTimeMillis() % 100000) + "!");
            User u = users.findByEmail(r.getEmail()).map(existing -> {
                // Mettre à jour le mot de passe avec celui choisi lors de l'inscription
                if (r.getPasswordHash() != null) existing.setPasswordHash(r.getPasswordHash());
                return users.save(existing);
            }).orElseGet(() -> {
                User nu = new User();
                nu.setEmail(r.getEmail());
                nu.setPasswordHash(hash);
                nu.setAppRole(AppRole.PERMANENT_MEMBER);
                return users.save(nu);
            });

            // Créer le profil membre seulement s'il n'en a pas déjà un
            if (members.findByUserId(u.getId()).isEmpty()) {
                Member m = new Member();
                m.setUserId(u.getId());
                String[] parts = r.getApplicantName().split(" ", 2);
                m.setFirstName(parts[0]);
                m.setLastName(parts.length > 1 ? parts[1] : "");
                m.setType(toMemberType(r.getRequestedRole()));
                members.save(m);
            }

            email.send(r.getEmail(), "Adhésion au laboratoire LIAS acceptée",
                    "Félicitations ! Votre adhésion au laboratoire LIAS a été acceptée.\n" +
                    "Vous pouvez dès maintenant vous connecter avec l'email et le mot de passe que vous avez choisis lors de votre inscription.");

        } else {
            r.setStatus(MembershipRequestStatus.REJECTED);
            email.send(r.getEmail(), "Adhésion au laboratoire LIAS refusée",
                    decision.reason() != null
                            ? "Votre demande n'a pas été retenue. Motif : " + decision.reason()
                            : "Votre demande d'adhésion au laboratoire LIAS n'a pas été retenue.");
        }

        audit.log("DECISION", "MembershipRequest", id,
                "Décision : " + r.getStatus() + " — par userId=" + actor.getId());
        return repo.save(r);
    }

    private MemberType toMemberType(String role) {
        if (role == null) return MemberType.PERMANENT;
        return switch (role.toLowerCase()) {
            case "doctorant", "doctoral" -> MemberType.DOCTORAL;
            case "membre associé", "associate" -> MemberType.ASSOCIATE;
            case "retraité", "retired" -> MemberType.RETIRED;
            default -> MemberType.PERMANENT;
        };
    }
}
