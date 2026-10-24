package ma.lias.repository;
import ma.lias.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import java.time.LocalDateTime;
public interface EventRepository extends JpaRepository<Event, Long> {
  List<Event> findTop10ByOrderByStartDateDesc();
  long countByStartDateBetween(LocalDateTime start, LocalDateTime end);
}
