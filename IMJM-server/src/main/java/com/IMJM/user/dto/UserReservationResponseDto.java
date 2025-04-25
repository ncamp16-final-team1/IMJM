package com.IMJM.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class UserReservationResponseDto {

    private Long reservationId;
    private String salonName;
    private String salonAddress;
    private String salonPhotoUrl;
    private Double salonScore;
    private Long reviewCount;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String reservationServiceName;
    private Integer price;
    private Boolean isReviewed;
    private Long reviewId; // 추가된 필드

    public UserReservationResponseDto(Object[] row) {
        this.reservationId = row[0] != null ? ((Number) row[0]).longValue() : null;
        this.salonName = (String) row[1];
        this.salonAddress = (String) row[2];
        this.salonPhotoUrl = (String) row[3];
        this.salonScore = row[4] != null ? ((Number) row[4]).doubleValue() : null;
        this.reviewCount = row[5] != null ? ((Number) row[5]).longValue() : 0L;
        this.reservationDate = row[6] != null ? ((java.sql.Date) row[6]).toLocalDate() : null;
        this.reservationTime = row[7] != null ? ((java.sql.Time) row[7]).toLocalTime() : null;
        this.reservationServiceName = (String) row[8];
        this.price = row[9] != null ? ((Number) row[9]).intValue() : null;
        this.isReviewed = (Boolean) row[10];
        this.reviewId = row.length > 11 && row[11] != null ? ((Number) row[11]).longValue() : null; // 11번 인덱스에 reviewId가 있다고 가정
    }
}