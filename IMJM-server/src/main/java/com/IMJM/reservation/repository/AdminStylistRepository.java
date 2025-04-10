package com.IMJM.reservation.repository;


import com.IMJM.common.entity.AdminStylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminStylistRepository extends JpaRepository<AdminStylist, Long> {

    // 특정 살롱의 스타일리스트 목록 조회
    List<AdminStylist> findBySalonId(String salonId);

    // 특정 스타일리스트 ID로 조회
    Optional<AdminStylist> findByStylistId(Long stylistId);


}
