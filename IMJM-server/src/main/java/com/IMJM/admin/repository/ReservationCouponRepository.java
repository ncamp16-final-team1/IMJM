package com.IMJM.admin.repository;

import com.IMJM.common.entity.ReservationCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationCouponRepository extends JpaRepository<ReservationCoupon, Long> {
    int countByCoupon_Id(Long id);
}
