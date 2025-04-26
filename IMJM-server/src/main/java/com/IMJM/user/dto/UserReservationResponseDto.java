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
    private Long reviewId;
    private String stylistName;
    private String salonId;

    public UserReservationResponseDto(Object[] row) {
        this.reservationId = row[0] != null ? ((Number) row[0]).longValue() : null;
        this.salonName = (String) row[1];
        this.salonAddress = (String) row[2];
        this.salonId = (String) row[3];
        this.stylistName = (String) row[4];
        this.salonPhotoUrl = (String) row[5];
        this.salonScore = row[6] != null ? ((Number) row[6]).doubleValue() : null;
        this.reviewCount = row[7] != null ? ((Number) row[7]).longValue() : 0L;
        this.reservationDate = row[8] != null ? ((java.sql.Date) row[8]).toLocalDate() : null;
        this.reservationTime = row[9] != null ? ((java.sql.Time) row[9]).toLocalTime() : null;
        this.reservationServiceName = (String) row[10];
        this.price = row[11] != null ? ((Number) row[11]).intValue() : null;
        this.isReviewed = (Boolean) row[12];
        this.reviewId = row[13] != null ? ((Number) row[13]).longValue() : null;
    }
}