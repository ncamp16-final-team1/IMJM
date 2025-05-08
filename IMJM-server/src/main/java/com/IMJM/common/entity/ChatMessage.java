package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @Column(name = "sender_type", nullable = false, length = 20)
    private String senderType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "sent_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime sentAt;

    @Column(name = "translated_message", columnDefinition = "TEXT")
    private String translatedMessage;

    @Column(name = "translation_status", length = 10)
    private String translationStatus = "none";

    public void markAsRead() {
        this.isRead = true;
    }

    public void updateTranslation(String translatedMessage, String status) {
        this.translatedMessage = translatedMessage;
        this.translationStatus = status;
    }
}