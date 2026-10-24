package ma.lias.repository;
import ma.lias.entity.MaterialInventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialInventoryRepository extends JpaRepository<MaterialInventory, Long> {
}
