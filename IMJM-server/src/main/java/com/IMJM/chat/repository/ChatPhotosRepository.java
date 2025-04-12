package com.IMJM.chat.repository;

import com.IMJM.common.entity.ChatPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatPhotosRepository extends JpaRepository<ChatPhotos, Long> {
    List<ChatPhotos> findByChatMessageId(Long chatMessageId);
}
