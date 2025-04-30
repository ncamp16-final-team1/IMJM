package com.IMJM.reservation.repository;

import com.IMJM.common.entity.Reservation;
import com.IMJM.user.dto.UserReservationResponseDto;
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

    @Query("SELECT r.user.id, COUNT(r) " +
            "FROM Reservation r " +
            "WHERE r.user.id IN :userIds " +
            "GROUP BY r.user.id")
    List<Object[]> countVisitByUserIds(@Param("userIds") List<String> userIds);

    @Query("""
                SELECT r FROM Reservation r
                WHERE r.stylist.salon.id = :salonId
                  AND (
                        r.reservationDate < CURRENT_DATE OR
                        (r.reservationDate = CURRENT_DATE AND r.reservationTime < CURRENT_TIME)
                      )
                ORDER BY r.reservationDate DESC, r.reservationTime DESC
            """)
    List<Reservation> findPastReservationsBySalonIdOrderByDateTimeDesc(String salonId);

    // 예약상세 조회
    Optional<Reservation> findById(Long id);

    // 사용자 ID로 예약을 날짜 내림차순으로 조회
    List<Reservation> findByUser_IdOrderByReservationDateDesc(String userId);
}



