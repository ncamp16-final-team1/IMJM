package com.IMJM.admin.repository;

import com.IMJM.common.entity.ReservationCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationCouponRepository extends JpaRepository<ReservationCoupon, Long> {
    int countByCoupon_Id(Long id);

    // 사용자가 사용한 쿠폰 조회
    List<ReservationCoupon> findByReservation_User_idAndCoupon_Salon_id(String userId,
                                                                        String salonId);
    // 예약상세조회
    Optional<ReservationCoupon> findByReservationId(Long reservationId);
}
