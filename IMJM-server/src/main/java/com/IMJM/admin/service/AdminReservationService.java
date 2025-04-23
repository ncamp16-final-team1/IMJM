package com.IMJM.admin.service;

import com.IMJM.admin.dto.AdminReservationDto;
import com.IMJM.admin.dto.AdminReservationDto.*;
import com.IMJM.reservation.repository.PaymentRepository;
import com.IMJM.common.entity.Payment;
import com.IMJM.common.entity.Reservation;
import com.IMJM.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
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

}
