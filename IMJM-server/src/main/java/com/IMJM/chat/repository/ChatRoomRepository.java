package com.IMJM.chat.repository;

import com.IMJM.common.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository  extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByUserIdAndSalonId(String userId, String salonId);
    List<ChatRoom> findByUserIdOrderByLastMessageTimeDesc(String userId);
    List<ChatRoom> findBySalonIdOrderByLastMessageTimeDesc(String salonId);
}
