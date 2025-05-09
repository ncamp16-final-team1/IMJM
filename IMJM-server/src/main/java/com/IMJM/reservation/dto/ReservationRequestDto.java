package com.IMJM.reservation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReservationRequestDto {
    private String paymentMethod;
    private String paymentStatus;
    private PaymentInfoDto paymentInfo;
    private PaymentRequestDto paymentRequest;
    private String salonId;
    private String orderId;

    @Data
    public static class PaymentInfoDto {
        private BigDecimal discountAmount;
        private Integer pointUsed;
        private String currency;
    }

    @Data
    public static class PaymentRequestDto {
        private BigDecimal price;
        private PointUsageDto pointUsage;
        private CouponDataDto couponData;
        private ReservationDataDto reservation;
    }

    @Data
    public static class PointUsageDto {
        private String usageType; // "USE" 또는 "SAVE"
        private Integer price;
        private String content;
    }

    @Data
    public static class CouponDataDto {
        private Long couponId;
        private BigDecimal discountAmount;
    }

    @Data
    public static class ReservationDataDto {
        private Long stylistId;
        private String reservationDate;
        private String reservationTime;
        private boolean isPaid;
        private String requirements;
        private Long serviceMenuId;
    }
}