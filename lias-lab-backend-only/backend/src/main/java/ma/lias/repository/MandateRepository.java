package ma.lias.repository;

import ma.lias.entity.Mandate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MandateRepository extends JpaRepository<Mandate, Long> {

    /**
     * Retourne le mandat actif à la date donnée (endDate null = mandat en cours).
     */
    @Query("SELECT m FROM Mandate m WHERE m.startDate <= :today AND (m.endDate IS NULL OR m.endDate >= :today)")
    Optional<Mandate> findActiveMandate(@Param("today") LocalDate today);

    /**
     * Vérifie si un membre donné est l'actuel directeur.
     */
    @Query("SELECT COUNT(m) > 0 FROM Mandate m WHERE m.directorId = :memberId AND m.startDate <= :today AND (m.endDate IS NULL OR m.endDate >= :today)")
    boolean isCurrentDirector(@Param("memberId") Long memberId, @Param("today") LocalDate today);

    /**
     * Vérifie si un membre donné est l'actuel vice-directeur.
     */
    @Query("SELECT COUNT(m) > 0 FROM Mandate m WHERE m.viceDirectorId = :memberId AND m.startDate <= :today AND (m.endDate IS NULL OR m.endDate >= :today)")
    boolean isCurrentViceDirector(@Param("memberId") Long memberId, @Param("today") LocalDate today);

    /** Historique complet trié du plus récent au plus ancien. */
    List<Mandate> findAllByOrderByStartDateDesc();
}
