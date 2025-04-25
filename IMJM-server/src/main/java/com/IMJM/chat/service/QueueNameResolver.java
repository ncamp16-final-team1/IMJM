package com.IMJM.chat.service;

import com.IMJM.config.RabbitMQConfig;
import com.IMJM.user.repository.UserRepository;
import com.IMJM.admin.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class QueueNameResolver {

    private final UserRepository userRepository;
    private final SalonRepository salonRepository;

    public String[] resolveQueueNames() {
        List<String> queueNames = new ArrayList<>();

        // 모든 사용자에 대한 큐 이름 생성
        userRepository.findAll().forEach(user ->
                queueNames.add(RabbitMQConfig.QUEUE_PREFIX + user.getId())
        );

        // 모든 미용실에 대한 큐 이름 생성
        salonRepository.findAll().forEach(salon ->
                queueNames.add(RabbitMQConfig.QUEUE_PREFIX + salon.getId())
        );

        return queueNames.toArray(new String[0]);
    }
}