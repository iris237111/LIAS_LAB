package ma.lias.repository;
import ma.lias.entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
  List<Publication> findTop10ByOrderByYearDescCreatedAtDesc();
  long countByYear(int year);
}

