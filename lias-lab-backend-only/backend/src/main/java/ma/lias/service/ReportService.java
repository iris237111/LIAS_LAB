package ma.lias.service;

import ma.lias.entity.AnnualReport;
import ma.lias.entity.Event;
import ma.lias.entity.Member;
import ma.lias.entity.Publication;
import ma.lias.repository.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

  private final EventRepository events;
  private final PublicationRepository publications;
  private final MemberRepository members;
  private final AnnualReportRepository reports;
  private final AuditService audit;

  public ReportService(EventRepository events,
                       PublicationRepository publications,
                       MemberRepository members,
                       AnnualReportRepository reports,
                       AuditService audit) {
    this.events       = events;
    this.publications = publications;
    this.members      = members;
    this.reports      = reports;
    this.audit        = audit;
  }

  public byte[] generate(int year) throws Exception {

    LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0);
    LocalDateTime end   = LocalDateTime.of(year, 12, 31, 23, 59);

    List<Event> yearEvents = events.findAll().stream()
            .filter(e -> e.getStartDate() != null &&
                    !e.getStartDate().isBefore(start) &&
                    !e.getStartDate().isAfter(end))
            .toList();

    List<Publication> yearPubs = publications.findAll().stream()
            .filter(p -> p.getYear() != null && p.getYear() == year)
            .toList();

    List<Member> allMembers = members.findAll();

    PDDocument doc = new PDDocument();
    PDPage page = new PDPage(PDRectangle.A4);
    doc.addPage(page);

    PDFont fontBold   = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    PDFont fontNormal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    float pageWidth = PDRectangle.A4.getWidth();
    float margin = 40;
    float contentWidth = pageWidth - 2 * margin;

    try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {

      // ── Header teal ──────────────────────────────────────
      cs.setNonStrokingColor(0.051f, 0.306f, 0.290f);
      cs.addRect(0, 780, 595, 62);
      cs.fill();

      cs.setNonStrokingColor(1f, 1f, 1f);
      cs.beginText();
      cs.setFont(fontBold, 20);
      cs.newLineAtOffset(margin, 812);
      cs.showText("Laboratoire LIAS");
      cs.endText();

      cs.beginText();
      cs.setFont(fontNormal, 11);
      cs.newLineAtOffset(margin, 793);
      cs.showText("Rapport d'activite annuel — " + year);
      cs.endText();

      cs.beginText();
      cs.setFont(fontNormal, 10);
      cs.newLineAtOffset(400, 793);
      cs.showText("Genere le : " + LocalDate.now());
      cs.endText();

      // ── Ligne teal ────────────────────────────────────────
      cs.setStrokingColor(0.176f, 0.906f, 0.749f);
      cs.setLineWidth(2);
      cs.moveTo(margin, 778);
      cs.lineTo(555, 778);
      cs.stroke();

      // ── Stats cards ───────────────────────────────────────
      cs.setNonStrokingColor(0f, 0f, 0f);
      cs.beginText();
      cs.setFont(fontBold, 13);
      cs.newLineAtOffset(margin, 755);
      cs.showText("Synthese de l'annee " + year);
      cs.endText();

      drawStatCard(cs, fontBold, fontNormal, margin,      710, "Evenements",   String.valueOf(yearEvents.size()));
      drawStatCard(cs, fontBold, fontNormal, margin + 175, 710, "Publications", String.valueOf(yearPubs.size()));
      drawStatCard(cs, fontBold, fontNormal, margin + 350, 710, "Membres",     String.valueOf(allMembers.size()));

      // ── Événements ────────────────────────────────────────
      float y = 670;
      cs.setNonStrokingColor(0.051f, 0.306f, 0.290f);
      cs.addRect(margin, y - 4, contentWidth, 20);
      cs.fill();

      cs.setNonStrokingColor(1f, 1f, 1f);
      cs.beginText();
      cs.setFont(fontBold, 11);
      cs.newLineAtOffset(margin + 5, y + 8);
      cs.showText("EVENEMENTS (" + yearEvents.size() + ")");
      cs.endText();

      y -= 20;
      if (yearEvents.isEmpty()) {
        cs.setNonStrokingColor(0.4f, 0.4f, 0.4f);
        cs.beginText();
        cs.setFont(fontNormal, 10);
        cs.newLineAtOffset(margin + 5, y - 5);
        cs.showText("Aucun evenement pour cette annee.");
        cs.endText();
        y -= 20;
      } else {
        for (Event e : yearEvents) {
          if (y < 100) break;
          cs.setNonStrokingColor(0f, 0f, 0f);
          cs.beginText();
          cs.setFont(fontBold, 10);
          cs.newLineAtOffset(margin + 5, y - 5);
          String title = e.getTitle() != null ? truncate(e.getTitle(), 55) : "Sans titre";
          cs.showText("• " + title);
          cs.endText();

          if (e.getStartDate() != null) {
            cs.beginText();
            cs.setFont(fontNormal, 9);
            cs.newLineAtOffset(400, y - 5);
            cs.showText(e.getStartDate().toLocalDate().toString());
            cs.endText();
          }
          y -= 16;
        }
      }

      // ── Publications ──────────────────────────────────────
      y -= 10;
      cs.setNonStrokingColor(0.051f, 0.306f, 0.290f);
      cs.addRect(margin, y - 4, contentWidth, 20);
      cs.fill();

      cs.setNonStrokingColor(1f, 1f, 1f);
      cs.beginText();
      cs.setFont(fontBold, 11);
      cs.newLineAtOffset(margin + 5, y + 8);
      cs.showText("PUBLICATIONS (" + yearPubs.size() + ")");
      cs.endText();

      y -= 20;
      if (yearPubs.isEmpty()) {
        cs.setNonStrokingColor(0.4f, 0.4f, 0.4f);
        cs.beginText();
        cs.setFont(fontNormal, 10);
        cs.newLineAtOffset(margin + 5, y - 5);
        cs.showText("Aucune publication pour cette annee.");
        cs.endText();
        y -= 20;
      } else {
        for (Publication p : yearPubs) {
          if (y < 100) break;
          cs.setNonStrokingColor(0f, 0f, 0f);
          cs.beginText();
          cs.setFont(fontBold, 10);
          cs.newLineAtOffset(margin + 5, y - 5);
          String title = p.getTitle() != null ? truncate(p.getTitle(), 55) : "Sans titre";
          cs.showText("• " + title);
          cs.endText();

          if (p.getAuthors() != null) {
            cs.beginText();
            cs.setFont(fontNormal, 9);
            cs.newLineAtOffset(margin + 5, y - 16);
            cs.showText("  " + truncate(p.getAuthors(), 70));
            cs.endText();
            y -= 12;
          }
          y -= 16;
        }
      }

      // ── Membres ───────────────────────────────────────────
      y -= 10;
      if (y > 120) {
        cs.setNonStrokingColor(0.051f, 0.306f, 0.290f);
        cs.addRect(margin, y - 4, contentWidth, 20);
        cs.fill();

        cs.setNonStrokingColor(1f, 1f, 1f);
        cs.beginText();
        cs.setFont(fontBold, 11);
        cs.newLineAtOffset(margin + 5, y + 8);
        cs.showText("MEMBRES ACTIFS (" + allMembers.size() + ")");
        cs.endText();

        y -= 20;
        for (Member m : allMembers) {
          if (y < 60) break;
          cs.setNonStrokingColor(0f, 0f, 0f);
          cs.beginText();
          cs.setFont(fontNormal, 10);
          cs.newLineAtOffset(margin + 5, y - 5);
          String name = (m.getFirstName() != null ? m.getFirstName() : "") + " " +
                  (m.getLastName()  != null ? m.getLastName()  : "");
          String type = m.getType() != null ? m.getType().toString() : "";
          cs.showText("• " + name.trim() + "  (" + type + ")");
          cs.endText();
          y -= 16;
        }
      }

      // ── Footer ────────────────────────────────────────────
      cs.setNonStrokingColor(0.051f, 0.306f, 0.290f);
      cs.addRect(0, 0, 595, 30);
      cs.fill();
      cs.setNonStrokingColor(1f, 1f, 1f);
      cs.beginText();
      cs.setFont(fontNormal, 8);
      cs.newLineAtOffset(margin, 11);
      cs.showText("(c) " + year + " Laboratoire LIAS — Faculte des Sciences Ben M'Sik, Casablanca — Document genere automatiquement");
      cs.endText();
    }

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    doc.save(out);
    doc.close();

    AnnualReport ar = new AnnualReport();
    ar.setYear(year);
    ar.setGeneratedAt(LocalDate.now().atStartOfDay());
    reports.save(ar);
    audit.log("GENERATE", "AnnualReport", (long) year, "Rapport " + year + " genere");

    return out.toByteArray();
  }

  private void drawStatCard(PDPageContentStream cs, PDFont bold, PDFont normal,
                            float x, float y, String label, String value) throws Exception {
    cs.setNonStrokingColor(0.941f, 0.992f, 0.980f);
    cs.addRect(x, y - 45, 160, 65);
    cs.fill();

    cs.setNonStrokingColor(0.051f, 0.584f, 0.533f);
    cs.beginText();
    cs.setFont(bold, 26);
    cs.newLineAtOffset(x + 10, y + 5);
    cs.showText(value);
    cs.endText();

    cs.setNonStrokingColor(0.4f, 0.4f, 0.4f);
    cs.beginText();
    cs.setFont(normal, 9);
    cs.newLineAtOffset(x + 10, y - 18);
    cs.showText(label);
    cs.endText();
  }

  private String truncate(String s, int max) {
    if (s == null) return "";
    return s.length() > max ? s.substring(0, max) + "..." : s;
  }
}