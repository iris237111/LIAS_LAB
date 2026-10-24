package ma.lias.controller;

import ma.lias.entity.Meeting;
import ma.lias.dto.MeetingMinutesRequest;
import ma.lias.repository.MeetingRepository;
import ma.lias.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/meetings") @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
public class MeetingController {
  private final MeetingRepository repo; private final AuditService audit;
  public MeetingController(MeetingRepository repo, AuditService audit){this.repo=repo;this.audit=audit;}
  @GetMapping public List<Meeting> all(){ return repo.findAll(); }
  @GetMapping("/{id}") public Meeting one(@PathVariable Long id){ return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable")); }
  @PostMapping public ResponseEntity<Meeting> create(@RequestBody Meeting body){ Meeting saved=repo.save(body); audit.log("CREATE","Meeting", saved.getId(), "Création"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @PutMapping("/{id}") public Meeting update(@PathVariable Long id, @RequestBody Meeting body){
    Meeting meeting=repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"));
    meeting.setTitle(body.getTitle()); meeting.setDate(body.getDate()); meeting.setLocation(body.getLocation()); meeting.setAgenda(body.getAgenda());
    Meeting saved=repo.save(meeting); audit.log("UPDATE","Meeting", id, "Modification"); return saved;
  }
  @PutMapping("/{id}/pv") public Meeting updateMinutes(@PathVariable Long id, @Valid @RequestBody MeetingMinutesRequest request){
    Meeting meeting=repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Réunion introuvable"));
    meeting.setPvContent(request.content().trim());
    Meeting saved=repo.save(meeting); audit.log("UPDATE","Meeting", id, "Mise à jour du procès-verbal"); return saved;
  }
  @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id){ if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Introuvable"); repo.deleteById(id); audit.log("DELETE","Meeting", id, "Suppression"); return ResponseEntity.noContent().build(); }
}
