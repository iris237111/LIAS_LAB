package ma.lias.controller;

import ma.lias.entity.Event;
import ma.lias.repository.EventRepository;
import ma.lias.service.AuditService;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/events")
public class EventController {
  private final EventRepository repo; private final AuditService audit;
  public EventController(EventRepository repo, AuditService audit){this.repo=repo;this.audit=audit;}
  @GetMapping public List<Event> all(){ return repo.findAll(); }
  @GetMapping("/{id}") public Event one(@PathVariable Long id){ return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable")); }
  @PostMapping public ResponseEntity<Event> create(@RequestBody Event body){ Event saved=repo.save(body); audit.log("CREATE","Event", saved.getId(), "Création"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @PutMapping("/{id}") public Event update(@PathVariable Long id, @RequestBody Event body){ if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"); body.setId(id); Event saved=repo.save(body); audit.log("UPDATE","Event", id, "Modification"); return saved; }
  @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id){ if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"); repo.deleteById(id); audit.log("DELETE","Event", id, "Suppression"); return ResponseEntity.noContent().build(); }
}
