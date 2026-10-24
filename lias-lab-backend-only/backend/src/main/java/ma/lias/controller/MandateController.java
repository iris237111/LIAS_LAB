package ma.lias.controller;

import ma.lias.entity.Mandate;
import ma.lias.repository.MandateRepository;
import ma.lias.service.AuditService;
import ma.lias.service.MandateService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mandates")
public class MandateController {

    private final MandateRepository repo;
    private final MandateService mandateService;
    private final AuditService audit;

    public MandateController(MandateRepository repo,
                             MandateService mandateService,
                             AuditService audit) {
        this.repo = repo;
        this.mandateService = mandateService;
        this.audit = audit;
    }

    // --------------------------------------------------------- //
    //  Lecture                                                   //
    // --------------------------------------------------------- //

    /** Historique complet de tous les mandats (du plus récent au plus ancien). */
    @GetMapping
    public List<Mandate> all() {
        return repo.findAllByOrderByStartDateDesc();
    }

    /** Détail d'un mandat par ID. */
    @GetMapping("/{id}")
    public Mandate one(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mandat introuvable."));
    }

    /**
     * Retourne le mandat actuellement actif.
     * Accessible à tous les membres authentifiés (utile pour l'UI).
     */
    @GetMapping("/active")
    public ResponseEntity<?> active() {
        return mandateService.getActiveMandate()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Map.of("message", "Aucun mandat actif.")));
    }

    // --------------------------------------------------------- //
    //  Création                                                  //
    // --------------------------------------------------------- //

    /**
     * Crée un nouveau mandat.
     * Clôture automatiquement le mandat précédent et met à jour les rôles.
     *
     * Body JSON attendu :
     * {
     *   "directorId": 3,
     *   "viceDirectorId": 5,   // optionnel
     *   "startDate": "2025-09-01"
     * }
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Mandate> create(@RequestBody Mandate body) {
        Mandate saved = mandateService.createMandate(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --------------------------------------------------------- //
    //  Clôture                                                   //
    // --------------------------------------------------------- //

    /**
     * Clôture manuellement un mandat.
     * Paramètre optionnel : endDate (défaut = aujourd'hui).
     *
     * PATCH /api/admin/mandates/{id}/close?endDate=2025-08-31
     */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public Mandate close(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return mandateService.closeMandate(id, endDate);
    }

    // --------------------------------------------------------- //
    //  Vérification utilitaire                                   //
    // --------------------------------------------------------- //

    /**
     * Vérifie si un membre donné est l'actuel directeur.
     * GET /api/admin/mandates/check-director?memberId=3
     */
    @GetMapping("/check-director")
    public Map<String, Object> checkDirector(@RequestParam Long memberId) {
        boolean result = repo.isCurrentDirector(memberId, LocalDate.now());
        return Map.of("memberId", memberId, "isCurrentDirector", result);
    }
}
