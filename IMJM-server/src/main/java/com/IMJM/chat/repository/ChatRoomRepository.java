package com.IMJM.chat.repository;

import com.IMJM.common.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository  extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByUserIdAndSalonId(String userId, String salonId);

    List<ChatRoom> findByUserIdOrderByLastMessageTimeDesc(String userId);

    List<ChatRoom> findBySalonIdOrderByLastMessageTimeDesc(String salonId);

    // 특정 채팅방 완전 삭제 메서드 추가
    @Modifying
    @Query("DELETE FROM ChatRoom cr WHERE cr.id = :chatRoomId")
    void deleteChatRoomCompletely(@Param("chatRoomId") Long chatRoomId);
}
