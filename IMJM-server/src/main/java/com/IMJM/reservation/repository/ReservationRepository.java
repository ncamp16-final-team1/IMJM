package com.IMJM.reservation.repository;

import com.IMJM.common.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 스타일리스트 ID와 예약 날짜를 기준으로 예약된 시간들을 가져오는 쿼리
    @Query("SELECT r.reservationTime FROM Reservation r WHERE r.stylist.stylistId = :stylistId AND r.reservationDate = :date")
    List<LocalTime> findBookedTimesByStylistAndDate(Long stylistId, LocalDate date);


}