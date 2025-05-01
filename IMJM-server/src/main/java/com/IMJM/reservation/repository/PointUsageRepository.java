package com.IMJM.reservation.repository;

import com.IMJM.common.entity.PointUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface PointUsageRepository extends JpaRepository<PointUsage, Long> {

    boolean existsByUserIdAndContent(String userId, String content);

    List<PointUsage> findByUserIdOrderByUseDateDesc(String id);
}