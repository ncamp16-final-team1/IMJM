package com.IMJM.reservation.repository;

import com.IMJM.reservation.entity.Stylist;
import com.IMJM.reservation.entity.StylistId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationStylistRepository extends JpaRepository<Stylist, StylistId> {
    // 특정 살롱의 스타일리스트 목록 조회
    List<Stylist> findByHairSalonId(String salonId);


}
