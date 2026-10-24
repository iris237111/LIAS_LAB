package ma.lias.controller;

import ma.lias.entity.*;
import ma.lias.repository.AnnualReportRepository;
import ma.lias.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class AnnualReportController {

    private final AnnualReportRepository repo;
    private final ReportService service;
    private final AuditService audit;

    public AnnualReportController(AnnualReportRepository repo, ReportService service, AuditService audit) {
        this.repo = repo;
        this.service = service;
        this.audit = audit;
    }

    @GetMapping
    public List<AnnualReport> all() {
        return repo.findAll();
    }

    @GetMapping("/generate")
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public ResponseEntity<byte[]> generate(@RequestParam(required = false) Integer year) throws Exception {
        int y = year == null ? Year.now().getValue() : year;
        byte[] pdf = service.generate(y);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-lias-" + y + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}