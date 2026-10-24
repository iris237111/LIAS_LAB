package ma.lias.controller;

import ma.lias.entity.AppRole;
import ma.lias.entity.Member;
import ma.lias.entity.Publication;
import ma.lias.entity.User;
import ma.lias.repository.MemberRepository;
import ma.lias.repository.PublicationRepository;
import ma.lias.service.AuditService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

  private final PublicationRepository repo;
  private final MemberRepository members;
  private final AuditService audit;

  public PublicationController(PublicationRepository repo,
                               MemberRepository members,
                               AuditService audit) {
    this.repo    = repo;
    this.members = members;
    this.audit   = audit;
  }

  // ── Lecture ───────────────────────────────────────────────────────

  @GetMapping
  public List<Publication> all() {
    return repo.findAll();
  }

  @GetMapping("/{id}")
  public Publication one(@PathVariable Long id) {
    return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Publication introuvable."));
  }

  // ── Ajout ─────────────────────────────────────────────────────────

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Publication> create(@RequestBody Publication body,
                                            Authentication auth) {

    User currentUser = (User) auth.getPrincipal();

    Member member = members.findByUserId(currentUser.getId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Aucun profil membre associé à votre compte."));

    if (body.getTitle() == null || body.getTitle().isBlank()) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Le titre est obligatoire.");
    }

    // Force addedBy avec le memberId correct (clé étrangère vers members)
    body.setAddedBy(member.getId());

    Publication saved = repo.save(body);
    audit.log("CREATE", "Publication", saved.getId(),
            "Ajouté par memberId=" + member.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  // ── Modification ──────────────────────────────────────────────────

  @PutMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public Publication update(@PathVariable Long id,
                            @RequestBody Publication body,
                            Authentication auth) {

    Publication existing = one(id);
    User currentUser = (User) auth.getPrincipal();
    Member member = members.findByUserId(currentUser.getId()).orElse(null);

    // Utilise getAppRole() directement — User n'implémente pas UserDetails
    boolean isAdmin = currentUser.getAppRole() == AppRole.ADMIN
            || currentUser.getAppRole() == AppRole.DIRECTOR;
    boolean isOwner = member != null
            && existing.getAddedBy() != null
            && existing.getAddedBy().equals(member.getId());

    if (!isAdmin && !isOwner) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
              "Vous ne pouvez modifier que vos propres publications.");
    }

    body.setId(id);
    body.setAddedBy(existing.getAddedBy()); // l'auteur original ne change pas
    Publication saved = repo.save(body);
    audit.log("UPDATE", "Publication", id, "Modification par userId=" + currentUser.getId());
    return saved;
  }

  // ── Suppression ───────────────────────────────────────────────────

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    if (!repo.existsById(id))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Introuvable.");
    repo.deleteById(id);
    audit.log("DELETE", "Publication", id, "Suppression");
    return ResponseEntity.noContent().build();
  }
}