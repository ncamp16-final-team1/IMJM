package com.IMJM.user.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class ReservationDetailResponseDto {
    private Long reservationId;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private String serviceName;
    private String serviceType;
    private int price;
    private String requirements;
    private String salonName;
    private String salonAddress;
    private String salonPhotoUrl;
    private String stylistName;
    private PaymentInfoDto paymentInfo;
    private CouponInfoDto couponInfo;
    private PointUsageDto pointUsage;


    @Getter
    @Builder
    public static class PaymentInfoDto {
        private String paymentMethod;
        private String paymentStatus;
        private OffsetDateTime paymentDate;
        private boolean isCanceled;
        private BigDecimal canceledAmount;
        private int price;
    }

    @Getter
    @Builder
    public static class CouponInfoDto {
        private String couponName;
        private String discountType;
        private int discountValue;
        private int discountAmount;
    }

    @Getter
    @Builder
    public static class PointUsageDto {
        private int points;
        private OffsetDateTime useDate;
        private String content;
    }

}