package com.IMJM.admin.repository;

import com.IMJM.common.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    List<Coupon> findBySalonId(String salonId);

    List<Coupon> findBySalonIdOrderByCreatedAtDesc(String salonId);
    //특정 매장의 쿠폰 전체 조회
    List<Coupon> findBySalon_id(String salonId);
}
