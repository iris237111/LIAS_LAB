package ma.lias.repository;
import ma.lias.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface MessageRepository extends JpaRepository<Message, Long> {
  List<Message> findTop50ByOrderBySentAtDesc();
  List<Message> findByEventIdOrderBySentAtAsc(Long eventId);

  @Query("SELECT m FROM Message m WHERE (m.senderId = :a AND m.receiverId = :b) OR (m.senderId = :b AND m.receiverId = :a) ORDER BY m.sentAt ASC")
  List<Message> findPrivateConversation(@Param("a") Long userA, @Param("b") Long userB);

  List<Message> findByReceiverIdAndSenderIdNotOrderBySentAtDesc(Long receiverId, Long senderId);
}
