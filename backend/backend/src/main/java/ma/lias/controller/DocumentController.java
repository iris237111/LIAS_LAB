package ma.lias.controller;

import ma.lias.entity.*;
import ma.lias.repository.DocumentRecordRepository;
import ma.lias.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController @RequestMapping("/api/documents")
public class DocumentController {
  private final DocumentRecordRepository repo; private final FileStorageService storage; private final AuditService audit;
  public DocumentController(DocumentRecordRepository repo, FileStorageService storage, AuditService audit){this.repo=repo;this.storage=storage;this.audit=audit;}
  @GetMapping public List<DocumentRecord> all(){ return repo.findAll(); }
  @PostMapping("/upload") public ResponseEntity<DocumentRecord> upload(@RequestParam MultipartFile file, @RequestParam DocumentType type, @RequestParam(required=false) Long eventId) throws Exception { DocumentRecord d=new DocumentRecord(); d.setFilename(file.getOriginalFilename()); d.setType(type); d.setEventId(eventId); d.setFileUrl(storage.save(file,"documents")); DocumentRecord saved=repo.save(d); audit.log("UPLOAD","Document",saved.getId(),"Document ajouté"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id){ repo.deleteById(id); audit.log("DELETE","Document",id,"Document supprimé"); return ResponseEntity.noContent().build(); }
}
