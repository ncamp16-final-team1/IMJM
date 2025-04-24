package com.IMJM.admin.repository;

import com.IMJM.common.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findBySalonIdOrderByLastMessageTimeDesc(String salonId);
    Optional<ChatRoom> findByUserIdAndSalonId(String userId, String salonId);
}
