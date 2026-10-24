package ma.lias.controller;

import ma.lias.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final MemberRepository members;
    private final PublicationRepository publications;
    private final EventRepository events;
    private final DocumentRecordRepository documents;

    public SearchController(MemberRepository members,
                            PublicationRepository publications,
                            EventRepository events,
                            DocumentRecordRepository documents) {
        this.members      = members;
        this.publications = publications;
        this.events       = events;
        this.documents    = documents;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String q) {

        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La recherche doit contenir au moins 2 caractères."));
        }

        String keyword = q.trim().toLowerCase();

        Map<String, Object> results = new LinkedHashMap<>();

        // Membres
        results.put("members", members.findAll().stream()
                .filter(m ->
                        (m.getFirstName() != null && m.getFirstName().toLowerCase().contains(keyword)) ||
                                (m.getLastName()  != null && m.getLastName().toLowerCase().contains(keyword)))
                .limit(10)
                .toList());

        // Publications
        results.put("publications", publications.findAll().stream()
                .filter(p ->
                        (p.getTitle()   != null && p.getTitle().toLowerCase().contains(keyword)) ||
                                (p.getAuthors() != null && p.getAuthors().toLowerCase().contains(keyword)))
                .limit(10)
                .toList());

        // Événements
        results.put("events", events.findAll().stream()
                .filter(e ->
                        (e.getTitle()       != null && e.getTitle().toLowerCase().contains(keyword)) ||
                                (e.getDescription() != null && e.getDescription().toLowerCase().contains(keyword)))
                .limit(10)
                .toList());

        // Documents
        results.put("documents", documents.findAll().stream()
                .filter(d ->
                        (d.getFilename() != null && d.getFilename().toLowerCase().contains(keyword)))
                .limit(10)
                .toList());

        results.put("query", q);
        results.put("total",
                ((List<?>) results.get("members")).size() +
                        ((List<?>) results.get("publications")).size() +
                        ((List<?>) results.get("events")).size() +
                        ((List<?>) results.get("documents")).size());

        return ResponseEntity.ok(results);
    }
}