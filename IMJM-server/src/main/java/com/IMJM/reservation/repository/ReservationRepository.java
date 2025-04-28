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

    List<Reservation> findByStylist_Salon_id(String salonId);

    @Query(
                        value = """
            SELECT
                r.id AS reservationId,
                s.name AS salonName,
                s.address AS salonAddress,
                st.salon_id AS salonId,
                st.name AS stylistName,
                COALESCE((
                    SELECT sp.photo_url
                    FROM imjm.salon_photos sp
                    WHERE sp.salon_id = s.id
                    ORDER BY sp.photo_order
                    LIMIT 1
                ), '기본이미지URL') AS salonPhotoUrl,
                s.score AS salonScore,
                (SELECT COUNT(rv.id) FROM imjm.review rv WHERE rv.salon_id = s.id) AS reviewCount,
                r.reservation_date AS reservationDate,
                r.reservation_time AS reservationTime,
                r.reservation_service_name AS reservationServiceName,
                COALESCE(p.price, r.reservation_price) AS price,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM imjm.review rv
                        WHERE rv.reservation_id = r.id
                          AND rv.user_id = r.user_id
                    ) THEN true
                    ELSE false
                END AS isReviewed,
                (SELECT rv.id FROM imjm.review rv WHERE rv.reservation_id = r.id AND rv.user_id = r.user_id) AS reviewId
            FROM imjm.reservation r
            JOIN imjm.admin_stylist st ON r.stylist_id = st.stylist_id
            JOIN imjm.salon s ON st.salon_id = s.id
            LEFT JOIN imjm.payment p ON p.reservation_id = r.id
            WHERE r.user_id = :userId
            ORDER BY 
                CASE WHEN r.reservation_date >= CURRENT_DATE THEN 0 ELSE 1 END,  
                CASE 
                    WHEN r.reservation_date >= CURRENT_DATE THEN r.reservation_date  
                    ELSE NULL
                END ASC,
                CASE 
                    WHEN r.reservation_date < CURRENT_DATE THEN r.reservation_date  
                    ELSE NULL
                END DESC,
                r.reservation_time
            """,
                        nativeQuery = true
                )
    List<Object[]> findByUser_IdNative(@Param("userId") String userId);



}



