package com.IMJM.admin.repository;

import com.IMJM.common.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);

    @Modifying
    @Query("UPDATE ChatMessage c SET c.isRead = true WHERE c.chatRoom.id = :chatRoomId")
    void updateMessagesAsRead(@Param("chatRoomId") Long chatRoomId);

    Optional<ChatMessage> findTopByChatRoomIdOrderBySentAtDesc(Long chatRoomId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.id = :chatRoomId AND cm.senderType = :senderType AND cm.isRead = false")
    int countByReadFalseAndSenderType(@Param("chatRoomId") Long chatRoomId, @Param("senderType") String senderType);
}