package ma.lias.controller;
import ma.lias.entity.*;
import ma.lias.repository.NotificationRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository repo;
    public NotificationController(NotificationRepository repo){this.repo=repo;}

    @GetMapping
    public List<Notification> all(org.springframework.security.core.Authentication auth){
        if(auth!=null && auth.getPrincipal() instanceof User u) return repo.findByUserIdOrderByCreatedAtDesc(u.getId());
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification body){
        Notification saved = repo.save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/read")
    public Notification read(@PathVariable Long id){
        Notification n = repo.findById(id).orElseThrow();
        n.setRead(true);
        return repo.save(n);
    }

    @PatchMapping("/read-all")
    public List<Notification> readAll(org.springframework.security.core.Authentication auth){
        List<Notification> list = all(auth);
        list.forEach(n -> n.setRead(true));
        return repo.saveAll(list);
    }
}
