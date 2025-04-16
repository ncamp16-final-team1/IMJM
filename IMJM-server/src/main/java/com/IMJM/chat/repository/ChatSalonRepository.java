package com.IMJM.chat.repository;

import com.IMJM.common.entity.Salon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSalonRepository extends JpaRepository<Salon, String> {
}
