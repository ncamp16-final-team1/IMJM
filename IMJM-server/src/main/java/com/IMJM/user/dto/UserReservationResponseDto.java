package com.IMJM.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class UserReservationDto {

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

    public UserReservationDto(Object[] row) {
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
    }
}