// IMJM-server/src/main/java/com/IMJM/chat/service/QueueNameResolver.java
package com.IMJM.chat.service;

import org.springframework.stereotype.Component;

@Component
public class QueueNameResolver {

    // 정적인 빈 배열 반환 - 앱 시작 시에는 큐가 동적으로 생성되므로 초기에는 큐를 구독하지 않음
    public String[] resolveQueueNames() {
        return new String[0]; // 초기에는 빈 배열 반환
    }
}