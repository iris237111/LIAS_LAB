package ma.lias.controller;

import ma.lias.entity.Convention;
import ma.lias.repository.ConventionRepository;
import ma.lias.service.AuditService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/conventions")
public class ConventionController {
  private final ConventionRepository repo; private final AuditService audit;
  public ConventionController(ConventionRepository repo, AuditService audit){this.repo=repo;this.audit=audit;}
  @GetMapping public List<Convention> all(){ return repo.findAll(); }
  @GetMapping("/{id}") public Convention one(@PathVariable Long id){ return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable")); }
  @PostMapping public ResponseEntity<Convention> create(@RequestBody Convention body){ Convention saved=repo.save(body); audit.log("CREATE","Convention", saved.getId(), "Création"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @PutMapping("/{id}") public Convention update(@PathVariable Long id, @RequestBody Convention body){ if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"); body.setId(id); Convention saved=repo.save(body); audit.log("UPDATE","Convention", id, "Modification"); return saved; }
  @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id){ if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"); repo.deleteById(id); audit.log("DELETE","Convention", id, "Suppression"); return ResponseEntity.noContent().build(); }
}
