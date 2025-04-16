package com.IMJM.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커 설정
        // 클라이언트가 구독할 수 있는 주제 prefix
        registry.enableSimpleBroker("/topic", "/queue");
        // 메시지 송신 주소 prefix
        registry.setApplicationDestinationPrefixes("/app");
        // 유저별 구독을 위한 prefix
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결 엔드포인트 등록
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // CORS 설정
                .withSockJS();  // SockJS 지원 활성화
    }
}
