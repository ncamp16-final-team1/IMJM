package com.IMJM.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class UserReservationResponseDto {
    private Long reservationId;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String serviceName;
    private String serviceType;
    private Integer price;
    private Boolean isPaid;
    private String salonId;
    private String salonName;
    private String salonAddress;
    private BigDecimal salonScore;
    private String salonPhotoUrl;
    private String stylistName;
    private Long reviewCount;
    private Boolean isReviewed;
    private Long reviewId;
    private String paymentMethod;
}
