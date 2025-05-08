package com.IMJM.admin.service;

import com.IMJM.admin.dto.CouponDto;
import com.IMJM.admin.repository.CouponRepository;
import com.IMJM.admin.repository.ReservationCouponRepository;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.Coupon;
import com.IMJM.common.entity.Salon;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private final SalonRepository salonRepository;
    private final ReservationCouponRepository reservationCouponRepository;

    public List<CouponDto> couponList(String salonId) {
        List<Coupon> coupons = couponRepository.findBySalonIdOrderByCreatedAtDesc(salonId);

        return coupons.stream()
                .map(coupon -> CouponDto.builder()
                        .id(coupon.getId())
                        .name(coupon.getName())
                        .discountType(coupon.getDiscountType())
                        .discountValue(coupon.getDiscountValue())
                        .minimumPurchase(coupon.getMinimumPurchase())
                        .startDate(LocalDate.from(coupon.getStartDate()))
                        .expiryDate(LocalDate.from(coupon.getExpiryDate()))
                        .isActive(coupon.getIsActive())
                        .createAt(coupon.getCreatedAt())
                        .useCount(reservationCouponRepository.countByCoupon_Id(coupon.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    public void createCoupon(String salonId, CouponDto couponDto) {

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));

        Coupon coupon = Coupon.builder()
                .name(couponDto.getName())
                .discountType(couponDto.getDiscountType())
                .discountValue(couponDto.getDiscountValue())
                .minimumPurchase(couponDto.getMinimumPurchase())
                .startDate(couponDto.getStartDate().atStartOfDay())
                .expiryDate(couponDto.getExpiryDate().atStartOfDay())
                .isActive(couponDto.isIsActive())
                .createdAt(OffsetDateTime.now())
                .salon(salon)
                .build();

        couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon Not Found"));

        couponRepository.delete(coupon);
    }

    @Transactional
    public void updateCoupon(Long id, CouponDto couponDto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coupon Not Found"));

        coupon.updateCoupon(couponDto);
    }
}
