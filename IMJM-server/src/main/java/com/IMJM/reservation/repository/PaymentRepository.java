package com.IMJM.reservation.repository;

import com.IMJM.common.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByReservation_Stylist_Salon_id(String salonId);

    Optional<Payment> findByReservationId(Long reservationId);
}
