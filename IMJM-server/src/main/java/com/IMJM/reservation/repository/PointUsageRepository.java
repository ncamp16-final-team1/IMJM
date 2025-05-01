package com.IMJM.reservation.repository;

import com.IMJM.common.entity.PointUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointUsageRepository extends JpaRepository<PointUsage, Long> {

    boolean existsByUserIdAndContent(String userId, String content);

    List<PointUsage> findByUserId(String userId);

    List<PointUsage> findByUserIdOrderByUseDateDesc(String id);
}