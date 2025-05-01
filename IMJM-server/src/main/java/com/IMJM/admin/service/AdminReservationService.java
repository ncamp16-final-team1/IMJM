package com.IMJM.admin.service;

import com.IMJM.admin.dto.AdminReservationDto;
import com.IMJM.admin.dto.AdminReservationDto.*;
import com.IMJM.admin.dto.DayCountDto;
import com.IMJM.reservation.repository.PaymentRepository;
import com.IMJM.common.entity.Payment;
import com.IMJM.common.entity.Reservation;
import com.IMJM.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReservationService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    public List<AdminReservationDto> getAdminReservation(String salonId, String date) {

        List<Payment> payments = paymentRepository.findByReservation_Stylist_Salon_id(salonId);

        if (date.equals("today")) {
            LocalDate today = LocalDate.now();

            return payments.stream()
                    .filter(payment -> payment.getReservation().getReservationDate().isEqual(today))
                    .sorted(Comparator.comparing(p -> p.getReservation().getReservationTime()))
                    .map(AdminReservationDto::new)
                    .collect(Collectors.toList());
        }

        return payments.stream()
                .filter(payment -> payment.getReservation().getReservationDate().isEqual(LocalDate.parse(date)))
                .sorted(Comparator.comparing(p -> p.getReservation().getReservationTime()))
                .map(AdminReservationDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateReservation(Long reservationId, AdminReservationUpdateDto adminReservationUpdateDto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("reservation not found"));

        reservation.updateReservation(
                adminReservationUpdateDto.getReservationDate(),
                adminReservationUpdateDto.getReservationTime()
        );
    }

    public Map<String, Long> getWeeklyReservationStats(String salonId) {
        System.out.println(salonId);
        LocalDate endDate = LocalDate.now();
        System.out.println(endDate);
        List<DayCountDto> result = reservationRepository.countReservationsByDayOfWeekBetween(
                salonId, endDate.minusDays(6), endDate);

        System.out.println(result);
        // 0:일 ~ 6:토 → 한글 요일 매핑
        String[] dayNames = {"일", "월", "화", "수", "목", "금", "토"};
        Map<String, Long> dayCounts = new LinkedHashMap<>();
        for (String day : dayNames) {
            dayCounts.put(day, 0L);
        }

        for (DayCountDto dto : result) {
            int dayIndex = dto.getDayOfWeek(); // 0~6
            String day = dayNames[dayIndex];
            dayCounts.put(day, dto.getCount());
        }

        return dayCounts;
    }

    public Map<String, Long> getMonthlyReservationStats(String salonId) {
        LocalDate endDate = LocalDate.now();
        List<DayCountDto> result = reservationRepository.countReservationsByDayOfWeekBetween(
                salonId, endDate.minusDays(27), endDate);

        String[] dayNames = {"일", "월", "화", "수", "목", "금", "토"};
        Map<String, Long> dayCounts = new LinkedHashMap<>();
        for (String day : dayNames) {
            dayCounts.put(day, 0L);
        }

        for (DayCountDto dto : result) {
            int dayIndex = dto.getDayOfWeek();
            String day = dayNames[dayIndex];
            dayCounts.put(day, Math.round(dto.getCount() / 4.0)); // 4주 평균
        }

        return dayCounts;
    }

}
