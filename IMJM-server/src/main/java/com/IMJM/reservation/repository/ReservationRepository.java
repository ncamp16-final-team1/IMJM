package com.IMJM.reservation.repository;

import com.IMJM.admin.dto.DayCountDto;
import com.IMJM.common.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT r.reservationTime FROM Reservation r WHERE r.stylist.stylistId = :stylistId AND r.reservationDate = :date")
    List<LocalTime> findBookedTimesByStylistAndDate(Long stylistId, LocalDate date);

    @Query("""
            SELECT r.user.id, COUNT(r)
            FROM Reservation r
            WHERE r.user.id IN :userIds
                  AND (
                        r.reservationDate < CURRENT_DATE OR
                        (r.reservationDate = CURRENT_DATE AND r.reservationTime < CURRENT_TIME)
                      )
            GROUP BY r.user.id
            """)
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

    Optional<Reservation> findById(Long id);

    List<Reservation> findByUser_IdOrderByReservationDateDesc(String userId);

    @Query(value = """
    SELECT EXTRACT(DOW FROM r.reservation_date) AS day_of_week, COUNT(*) AS count
    FROM reservation r
    WHERE r.reservation_date BETWEEN :startDate AND :endDate
      AND r.stylist_id IN (
          SELECT s.stylist_id
          FROM admin_stylist s
          WHERE s.salon_id = :salonId
      )
    GROUP BY EXTRACT(DOW FROM r.reservation_date)
    ORDER BY day_of_week
    """, nativeQuery = true)
    List<DayCountDto> countReservationsByDayOfWeekBetween(
            @Param("salonId") String salonId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
    SELECT s, COUNT(r) as reservationCount
    FROM Reservation r 
    JOIN r.stylist st 
    JOIN st.salon s 
    GROUP BY s.id 
    ORDER BY reservationCount DESC
    """)
    Page<Object[]> findPopularSalonsByReservationCount(Pageable pageable);
}



