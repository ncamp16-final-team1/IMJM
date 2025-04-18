package com.IMJM.reservation.repository;

import com.IMJM.common.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    //특정 매장의 쿠폰 전체 조회
    List<Coupon> findBySalon_id(String salonId);


}
