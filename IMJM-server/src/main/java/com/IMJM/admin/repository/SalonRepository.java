package com.IMJM.admin.repository;

import com.IMJM.common.entity.Salon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface SalonRepository extends JpaRepository<Salon, String> {

   boolean existsById(String id);

   Optional<Salon> findById(String id);

   // 위치 기반 검색용 메서드
   @Query(value = "SELECT * FROM (" +
           "SELECT s.*, " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(s.latitude)) * " +
           "cos(radians(s.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(s.latitude)))) AS distance " +
           "FROM imjm.salon s" +
           ") AS salon_with_distance " +
           "WHERE distance <= :radius " +
           "ORDER BY distance",
           countQuery = "SELECT COUNT(*) FROM (" +
                   "SELECT s.*, " +
                   "(6371 * acos(cos(radians(:latitude)) * cos(radians(s.latitude)) * " +
                   "cos(radians(s.longitude) - radians(:longitude)) + " +
                   "sin(radians(:latitude)) * sin(radians(s.latitude)))) AS distance " +
                   "FROM salon s" +
                   ") AS salon_with_distance " +
                   "WHERE distance <= :radius",
           nativeQuery = true)
   Page<Salon> findNearbySalons(
           @Param("latitude") BigDecimal latitude,
           @Param("longitude") BigDecimal longitude,
           @Param("radius") BigDecimal radius,
           Pageable pageable);
}