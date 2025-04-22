package com.IMJM.admin.repository;

import com.IMJM.common.entity.ChatPhotos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminChatPhotosRepository extends JpaRepository<ChatPhotos, Long> {
    List<ChatPhotos> findByChatMessageId(Long chatMessageId);
    List<ChatPhotos> findByChatMessageIdIn(List<Long> chatMessageIds);
}