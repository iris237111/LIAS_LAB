package ma.lias.controller;

import ma.lias.entity.*;
import ma.lias.repository.*;
import ma.lias.service.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/members")
public class MemberController {
  private final MemberRepository members; private final UserRepository users; private final AffiliationRepository affiliations; private final RoleHistoryRepository roles; private final AuditService audit; private final FileStorageService storage;
  public MemberController(MemberRepository members, UserRepository users, AffiliationRepository affiliations, RoleHistoryRepository roles, AuditService audit, FileStorageService storage){this.members=members;this.users=users;this.affiliations=affiliations;this.roles=roles;this.audit=audit;this.storage=storage;}
  @GetMapping public List<Map<String,Object>> all(Authentication auth){ boolean admin=isAdmin(auth); return members.findAll().stream().map(m -> map(m,admin)).toList(); }
  @GetMapping("/{id}") public Map<String,Object> one(@PathVariable Long id, Authentication auth){ Member m=members.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Membre introuvable")); Map<String,Object> out=map(m,isAdmin(auth)); out.put("affiliations", affiliations.findAll().stream().filter(a -> Objects.equals(a.getMemberId(), id)).toList()); out.put("roles", roles.findAll().stream().filter(r -> Objects.equals(r.getMemberId(), id)).toList()); return out; }
  @GetMapping("/me") public Map<String,Object> me(Authentication auth){ User u=(User)auth.getPrincipal(); Member m=members.findByUserId(u.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Profil introuvable")); return one(m.getId(), auth); }
  @PostMapping public ResponseEntity<Member> create(@RequestBody Member body){ Member saved=members.save(body); audit.log("CREATE","Member",saved.getId(),"Création membre"); return ResponseEntity.status(HttpStatus.CREATED).body(saved); }
  @PutMapping("/{id}") public Member update(@PathVariable Long id, @RequestBody Member body){ if(!members.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Membre introuvable"); body.setId(id); Member saved=members.save(body); audit.log("UPDATE","Member",id,"Modification profil"); return saved; }
  @PostMapping("/{id}/photo") public Member photo(@PathVariable Long id, @RequestParam MultipartFile file) throws Exception { Member m=members.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Membre introuvable")); m.setPhotoUrl(storage.save(file,"photos")); audit.log("UPLOAD","Member",id,"Photo mise à jour"); return members.save(m); }
  @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ Member m=members.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Membre introuvable")); Long userId=m.getUserId(); members.deleteById(id); if(userId!=null) users.deleteById(userId); audit.log("DELETE","Member",id,"Suppression membre + user userId="+userId); return ResponseEntity.noContent().build(); }
  @PatchMapping("/{id}/type") public Member changeType(@PathVariable Long id, @RequestParam MemberType type){ Member m=members.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Membre introuvable")); m.setType(type); audit.log("STATUS_CHANGE","Member",id,"Nouveau type: "+type); return members.save(m); }
  private boolean isAdmin(Authentication auth){ return auth!=null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")); }
  private Map<String,Object> map(Member m, boolean admin){ Map<String,Object> x=new LinkedHashMap<>(); x.put("id",m.getId());x.put("userId",m.getUserId());x.put("firstName",m.getFirstName());x.put("lastName",m.getLastName());x.put("photoUrl",m.getPhotoUrl());x.put("hireDate",m.getHireDate());x.put("biography",m.getBiography());x.put("interests",m.getInterests());x.put("establishment",m.getEstablishment());x.put("originLab",m.getOriginLab());x.put("currentTeamId",m.getCurrentTeamId());x.put("type",m.getType()); if(admin) x.put("birthDate",m.getBirthDate()); return x; }
}
