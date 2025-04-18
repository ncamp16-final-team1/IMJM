package com.IMJM.admin.repository;

import com.IMJM.common.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    List<Coupon> findBySalonId(String salonId);

    List<Coupon> findBySalonIdOrderByCreatedAtDesc(String salonId);
}
