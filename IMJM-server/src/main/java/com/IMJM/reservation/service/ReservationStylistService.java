package com.IMJM.reservation.service;

import com.IMJM.admin.repository.CouponRepository;
import com.IMJM.admin.repository.ReservationCouponRepository;
import com.IMJM.common.entity.AdminStylist;
import com.IMJM.common.entity.Coupon;
import com.IMJM.common.entity.ReservationCoupon;
import com.IMJM.common.entity.ServiceMenu;
import com.IMJM.reservation.dto.*;
import com.IMJM.reservation.repository.AdminStylistRepository;
import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.admin.repository.ServiceMenuRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class ReservationStylistService {
    private final AdminStylistRepository adminStylistRepository;

    private final ReservationRepository reservationRepository;

    private final ServiceMenuRepository serviceMenuRepository;

    private final CouponRepository couponRepository;

    private final ReservationCouponRepository reservationCouponRepository;

    @Transactional(readOnly = true)
    public List<ReservationStylistDto> getStylistsBySalon(String salonId) {
        return adminStylistRepository.findBySalonId(salonId).stream()
                .map(ReservationStylistDto::new)
                .collect(Collectors.toList());
    }

    public StylistAndSalonDetailsDto getStylistAndSalonDetails(Long stylistId) {
        return adminStylistRepository.findByStylistId(stylistId)
                .map(StylistAndSalonDetailsDto::new)
                .orElseThrow(() -> new EntityNotFoundException("해당 스타일리스트가 없습니다."));
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> getAvailableAndBookedTimeMap(Long stylistId, LocalDate date) {
        AdminStylist stylist = adminStylistRepository.findById(stylistId)
                .orElseThrow(() -> new RuntimeException("스타일리스트를 찾을 수 없습니다."));

        LocalTime salonStart = stylist.getSalon().getStartTime();
        LocalTime salonEnd = stylist.getSalon().getEndTime();

        LocalTime stylistStart = stylist.getStartTime();
        LocalTime stylistEnd = stylist.getEndTime();

        int timeUnit = stylist.getSalon().getTimeUnit();

        LocalTime startTime = stylistStart.isBefore(salonStart) ? salonStart : stylistStart;
        LocalTime endTime = stylistEnd.isAfter(salonEnd) ? salonEnd : stylistEnd;

        List<LocalTime> bookedTimes = reservationRepository.findBookedTimesByStylistAndDate(stylistId, date);
        Set<LocalTime> bookedTimeSet = new HashSet<>(bookedTimes);

        List<String> availableTimes = new ArrayList<>();
        List<String> bookedTimesFormatted = bookedTimes.stream()
                .map(time -> time.format(DateTimeFormatter.ofPattern("HH:mm")))
                .toList();

        LocalTime current = startTime;
        while (current.plusMinutes(timeUnit).minusNanos(1).isBefore(endTime)) {
            if (!bookedTimeSet.contains(current)) {
                availableTimes.add(current.format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            current = current.plusMinutes(timeUnit);
        }

        Map<String, List<String>> result = new HashMap<>();
        result.put("availableTimes", availableTimes);
        result.put("bookedTimes", bookedTimesFormatted);

        return result;
    }

    public List<ReservationServiceMenuDto> getServiceMenusBySalonId(String salonId) {
        List<ServiceMenu> menus = serviceMenuRepository.findBySalonId(salonId);

        return menus.stream()
                .map(menu -> new ReservationServiceMenuDto(
                        menu.getId(),
                        menu.getServiceType(),
                        menu.getServiceName(),
                        menu.getServiceDescription(),
                        menu.getPrice(),
                        menu.getSalon().getId()
                ))
                .collect(Collectors.toList());
    }

    // 쿠폰 정보를 가져오는 메소드
    public List<SalonCouponDto> getCoupons(String salonId, int totalAmount, String userId) {
        log.info("쿠폰 조회 파라미터 - salonId: {}, totalAmount: {}, userId: {}", salonId, totalAmount, userId);
        List<Coupon> coupons = couponRepository.findBySalonId(salonId);
        log.info("조회된 쿠폰 개수: {}", coupons.size());

        List<ReservationCoupon> usedCoupons = reservationCouponRepository
                .findByReservation_User_idAndCoupon_Salon_id(userId, salonId);

        // 사용한 쿠폰 ID만 추출
        Set<Long> usedCouponIds = usedCoupons.stream()
                .map(rc -> rc.getCoupon().getId())
                .collect(Collectors.toSet());

        LocalDate now = LocalDate.now();

        return coupons.stream()
                .map(coupon -> {
                    boolean meetsMinPurchase = coupon.getMinimumPurchase() <= totalAmount;
                    boolean isActive = coupon.getIsActive();
                    boolean isWithinValidPeriod = !coupon.getStartDate().toLocalDate().isAfter(now)
                            && !coupon.getExpiryDate().toLocalDate().isBefore(now);
                    boolean notUsedBefore = !usedCouponIds.contains(coupon.getId());

                    boolean isAvailable = meetsMinPurchase && isActive && isWithinValidPeriod && notUsedBefore;

                    return SalonCouponDto.builder()
                            .couponId(coupon.getId())
                            .couponName(coupon.getName())
                            .discountType(coupon.getDiscountType())
                            .discountValue(coupon.getDiscountValue())
                            .minimumPurchase(coupon.getMinimumPurchase())
                            .startDate(coupon.getStartDate())
                            .expiryDate(coupon.getExpiryDate())
                            .isActive(coupon.getIsActive())
                            .isAvailable(isAvailable)
                            .totalAmount(totalAmount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}