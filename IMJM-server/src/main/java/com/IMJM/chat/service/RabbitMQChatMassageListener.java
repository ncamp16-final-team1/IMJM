package com.IMJM.chat.service;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQChatMessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = "#{queueNameResolver.resolveQueueNames()}")
    public void receiveMessage(ChatMessageDto message) {
        log.info("Received message: {}", message);

        // 웹소켓을 통해 메시지 전달 (기존 웹소켓 클라이언트와의 호환성 유지)
        // 수신자 타입에 따라 적절한 경로로 전달
        if ("USER".equals(message.getSenderType())) {
            // 미용실에게 전달
            String destination = "/user/" + message.getChatRoomId() + "/queue/messages";
            messagingTemplate.convertAndSend(destination, message);
        } else {
            // 사용자에게 전달
            String destination = "/user/" + message.getSenderId() + "/queue/messages";
            messagingTemplate.convertAndSend(destination, message);
        }
    }
}