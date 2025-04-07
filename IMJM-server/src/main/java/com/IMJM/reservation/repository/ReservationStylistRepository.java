package com.IMJM.reservation.repository;

import com.IMJM.reservation.entity.AdminStylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationStylistRepository extends JpaRepository<AdminStylist, Integer> {
    // 특정 살롱의 스타일리스트 목록 조회
    List<AdminStylist> findByHairSalonId(String salonId);

    // 스타일리스트 ID로 조회
    Optional<AdminStylist> findByStylistId(Integer stylistId);
}
