package ma.lias.service;

import ma.lias.entity.AppRole;
import ma.lias.entity.Mandate;
import ma.lias.entity.Member;
import ma.lias.entity.User;
import ma.lias.repository.MandateRepository;
import ma.lias.repository.MemberRepository;
import ma.lias.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class MandateService {

    private final MandateRepository mandates;
    private final MemberRepository members;
    private final UserRepository users;
    private final AuditService audit;

    public MandateService(MandateRepository mandates,
                          MemberRepository members,
                          UserRepository users,
                          AuditService audit) {
        this.mandates = mandates;
        this.members  = members;
        this.users    = users;
        this.audit    = audit;
    }

    // ------------------------------------------------------------------ //
    //  Consultation                                                        //
    // ------------------------------------------------------------------ //

    /** Retourne le mandat actuellement actif, ou empty si aucun. */
    public Optional<Mandate> getActiveMandate() {
        return mandates.findActiveMandate(LocalDate.now());
    }

    /**
     * Vérifie qu'il existe un mandat actif et que l'utilisateur connecté
     * en est bien le directeur (via son Member associé).
     * Lève 403 sinon.
     */
    public void assertIsActiveDirector(User currentUser) {
        Mandate active = mandates.findActiveMandate(LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Aucun mandat actif — action impossible."));

        Member member = members.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Profil membre introuvable."));

        if (!active.getDirectorId().equals(member.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Seul le directeur du mandat actif peut effectuer cette action.");
        }
    }

    // ------------------------------------------------------------------ //
    //  Création d'un nouveau mandat                                       //
    // ------------------------------------------------------------------ //

    /**
     * Crée un nouveau mandat.
     * Règles :
     *  - Le directeur et le vice-directeur doivent être des membres existants.
     *  - Si un mandat actif existe déjà, il est automatiquement clôturé (endDate = startDate - 1 jour).
     *  - Les rôles AppRole des utilisateurs concernés sont mis à jour.
     */
    @Transactional
    public Mandate createMandate(Mandate body) {
        // Vérification des membres
        Member director = members.findById(body.getDirectorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Directeur introuvable (memberId=" + body.getDirectorId() + ")"));

        Member viceDir = null;
        if (body.getViceDirectorId() != null) {
            viceDir = members.findById(body.getViceDirectorId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Vice-directeur introuvable (memberId=" + body.getViceDirectorId() + ")"));
        }

        if (body.getStartDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début est obligatoire.");
        }

        // Clôturer le mandat actif s'il existe
        mandates.findActiveMandate(LocalDate.now()).ifPresent(current -> {
            if (!current.getId().equals(body.getId())) {  // pas le même
                current.setEndDate(body.getStartDate().minusDays(1));
                mandates.save(current);
                // Rétrograder les anciens titulaires
                revokeDirectorRole(current.getDirectorId());
                if (current.getViceDirectorId() != null) {
                    revokeViceDirectorRole(current.getViceDirectorId());
                }
                audit.log("CLOSE", "Mandate", current.getId(),
                        "Mandat clôturé automatiquement à la création d'un nouveau mandat.");
            }
        });

        // Sauvegarder le nouveau mandat
        Mandate saved = mandates.save(body);

        // Promouvoir les nouveaux titulaires
        promoteToDirector(director.getUserId());
        if (viceDir != null) {
            promoteToViceDirector(viceDir.getUserId());
        }

        audit.log("CREATE", "Mandate", saved.getId(),
                "Nouveau mandat — directeur memberId=" + body.getDirectorId());
        return saved;
    }

    // ------------------------------------------------------------------ //
    //  Clôture manuelle d'un mandat                                       //
    // ------------------------------------------------------------------ //

    @Transactional
    public Mandate closeMandate(Long mandateId, LocalDate endDate) {
        Mandate m = mandates.findById(mandateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mandat introuvable."));

        if (m.getEndDate() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce mandat est déjà clôturé.");
        }

        LocalDate fin = endDate != null ? endDate : LocalDate.now();
        m.setEndDate(fin);
        Mandate saved = mandates.save(m);

        revokeDirectorRole(m.getDirectorId());
        if (m.getViceDirectorId() != null) revokeViceDirectorRole(m.getViceDirectorId());

        audit.log("CLOSE", "Mandate", mandateId, "Mandat clôturé manuellement au " + fin);
        return saved;
    }

    // ------------------------------------------------------------------ //
    //  Helpers rôles                                                       //
    // ------------------------------------------------------------------ //

    private void promoteToDirector(Long userId) {
        if (userId == null) return;
        users.findById(userId).ifPresent(u -> {
            u.setAppRole(AppRole.DIRECTOR);
            users.save(u);
        });
    }

    private void promoteToViceDirector(Long userId) {
        if (userId == null) return;
        users.findById(userId).ifPresent(u -> {
            u.setAppRole(AppRole.VICE_DIRECTOR);
            users.save(u);
        });
    }

    private void revokeDirectorRole(Long memberId) {
        if (memberId == null) return;
        members.findById(memberId).ifPresent(m -> {
            if (m.getUserId() != null) {
                users.findById(m.getUserId()).ifPresent(u -> {
                    u.setAppRole(AppRole.PERMANENT_MEMBER);
                    users.save(u);
                });
            }
        });
    }

    private void revokeViceDirectorRole(Long memberId) {
        revokeDirectorRole(memberId); // même logique : retour PERMANENT_MEMBER
    }
}
