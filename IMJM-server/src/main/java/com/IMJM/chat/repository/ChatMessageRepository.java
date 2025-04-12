package com.IMJM.chat.repository;

import com.IMJM.common.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository  extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);

    @Modifying
    @Query("UPDATE ChatMessage c SET c.isRead = true WHERE c.chatRoom.id = :chatRoomId AND c.senderType = :senderType AND c.isRead = false")
    void updateMessagesAsRead(Long chatRoomId, String senderType);
}