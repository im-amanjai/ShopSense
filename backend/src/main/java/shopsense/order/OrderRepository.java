package shopsense.order;

import org.springframework.data.jpa.repository.JpaRepository;
import shopsense.user.User;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);
}