package ma.lias.controller;

import ma.lias.entity.*;
import ma.lias.repository.*;
import ma.lias.service.AuditService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequestMapping("/api/material-requests")
public class MaterialRequestController {
  private final MaterialRequestRepository repo; private final AuditService audit;
  public MaterialRequestController(MaterialRequestRepository repo, AuditService audit){this.repo=repo;this.audit=audit;}
  @GetMapping public List<MaterialRequest> all(){return repo.findAll();}
  @GetMapping("/{id}") public MaterialRequest one(@PathVariable Long id){return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Demande introuvable"));}
  @PostMapping public ResponseEntity<MaterialRequest> create(@RequestBody MaterialRequest body, org.springframework.security.core.Authentication auth){ if(auth!=null && auth.getPrincipal() instanceof User u) body.setRequestedBy(u.getId()); MaterialRequest saved=repo.save(body); audit.log("CREATE","MaterialRequest",saved.getId(),"Demande matériel"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @PostMapping("/{id}/decision") @PreAuthorize("hasAnyRole('DIRECTOR','VICE_DIRECTOR','ADMIN')") public MaterialRequest decision(@PathVariable Long id, @RequestParam MaterialRequestStatus status, org.springframework.security.core.Authentication auth){ MaterialRequest r=one(id); r.setStatus(status); if(auth!=null && auth.getPrincipal() instanceof User u) r.setReviewedBy(u.getId()); r.setReviewedAt(LocalDateTime.now()); audit.log("DECISION","MaterialRequest",id,"Décision: "+status); return repo.save(r); }
}
