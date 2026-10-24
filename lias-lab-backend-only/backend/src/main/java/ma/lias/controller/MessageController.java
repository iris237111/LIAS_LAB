package ma.lias.controller;
import ma.lias.entity.*;
import ma.lias.repository.MessageRepository;
import ma.lias.repository.NotificationRepository;
import ma.lias.service.AuditService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/messages")
public class MessageController {
    private final MessageRepository repo;
    private final NotificationRepository notifRepo;
    private final AuditService audit;

    public MessageController(MessageRepository repo, NotificationRepository notifRepo, AuditService audit){
        this.repo=repo; this.notifRepo=notifRepo; this.audit=audit;
    }

    @GetMapping
    public List<Message> all(@RequestParam(required=false) Long eventId){
        return eventId==null ? repo.findTop50ByOrderBySentAtDesc() : repo.findByEventIdOrderBySentAtAsc(eventId);
    }

    @GetMapping("/private/{otherUserId}")
    public List<Message> privateChat(@PathVariable Long otherUserId, Authentication auth){
        if(auth==null || !(auth.getPrincipal() instanceof User u)) return List.of();
        return repo.findPrivateConversation(u.getId(), otherUserId);
    }

    @PostMapping
    public ResponseEntity<Message> create(@RequestBody Message body, Authentication auth){
        if(auth!=null && auth.getPrincipal() instanceof User u) body.setSenderId(u.getId());
        // Si message privé, désactiver globalMessage
        if(body.getReceiverId() != null) body.setGlobalMessage(false);
        Message saved = repo.save(body);
        // Créer une notification pour le destinataire si message privé
        if(saved.getReceiverId() != null){
            String senderName = auth!=null && auth.getPrincipal() instanceof User u2 ? u2.getEmail() : "Quelqu'un";
            Notification n = new Notification();
            n.setUserId(saved.getReceiverId());
            n.setMessage("Nouveau message privé de " + senderName);
            n.setType("PRIVATE_MESSAGE:" + saved.getSenderId());
            n.setRead(false);
            notifRepo.save(n);
        }
        audit.log("CREATE","Message",saved.getId(),"Message");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> update(@PathVariable Long id, @RequestBody Message body, Authentication auth){
        Message existing = repo.findById(id).orElse(null);
        if(existing==null) return ResponseEntity.notFound().build();
        if(auth!=null && auth.getPrincipal() instanceof User u){
            if(!existing.getSenderId().equals(u.getId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        existing.setContent(body.getContent());
        audit.log("UPDATE","Message",id,"Message modifié");
        return ResponseEntity.ok(repo.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth){
        Message existing = repo.findById(id).orElse(null);
        if(existing==null) return ResponseEntity.notFound().build();
        if(auth!=null && auth.getPrincipal() instanceof User u){
            boolean isAdmin = u.getAppRole()==AppRole.ADMIN || u.getAppRole()==AppRole.DIRECTOR;
            if(!existing.getSenderId().equals(u.getId()) && !isAdmin) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        repo.deleteById(id);
        audit.log("DELETE","Message",id,"Message supprimé");
        return ResponseEntity.noContent().build();
    }
}
