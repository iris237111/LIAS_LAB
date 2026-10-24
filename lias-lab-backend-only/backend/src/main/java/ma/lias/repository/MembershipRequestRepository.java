package ma.lias.repository;
import ma.lias.entity.MembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import ma.lias.entity.MembershipRequestStatus;

public interface MembershipRequestRepository extends JpaRepository<MembershipRequest, Long> {
  List<MembershipRequest> findByStatus(MembershipRequestStatus status);
  boolean existsByEmailAndStatus(String email, MembershipRequestStatus status);
}
