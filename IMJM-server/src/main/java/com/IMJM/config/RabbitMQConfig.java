// IMJM-server/src/main/java/com/IMJM/config/RabbitMQConfig.java
package com.IMJM.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.listener.adapter.MessageListenerAdapter;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.IMJM.chat.service.RabbitMQChatMessageListener;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "chat.exchange";
    public static final String QUEUE_PREFIX = "chat.queue.";
    public static final String ROUTING_KEY_PREFIX = "chat.routingKey.";

    @Bean
    public TopicExchange chatExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }

    @Bean
    public SimpleMessageListenerContainer messageListenerContainer(
            ConnectionFactory connectionFactory,
            MessageListenerAdapter listenerAdapter) {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setMessageListener(listenerAdapter);
        // 앱 시작 시에는 큐를 할당하지 않음
        container.setMissingQueuesFatal(false); // 큐가 없어도 치명적 오류가 아님
        container.setAutoStartup(false); // 자동 시작 비활성화
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(RabbitMQChatMessageListener listener, Jackson2JsonMessageConverter jsonMessageConverter) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(listener, "receiveMessage");
        adapter.setMessageConverter(jsonMessageConverter);
        return adapter;
    }
}