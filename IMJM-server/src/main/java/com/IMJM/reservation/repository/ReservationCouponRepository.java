package com.IMJM.reservation.repository;

import com.IMJM.common.entity.ReservationCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationCouponRepository extends JpaRepository<ReservationCoupon, Long> {

    // 사용자가 사용한 쿠폰 조회
    List<ReservationCoupon> findByReservation_User_idAndCoupon_Salon_id(String userId,
                                                                        String salonId);
}