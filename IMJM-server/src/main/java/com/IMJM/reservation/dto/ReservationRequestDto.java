package com.IMJM.reservation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReservationRequestDto {
    private String payment_method;
    private String payment_status;
    private PaymentInfoDto payment_info;
    private PaymentRequestDto paymentRequest;
    private String salonId;

    @Data
    public static class PaymentInfoDto {
        private BigDecimal discount_amount;
        private Integer point_used;
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
        private String usage_type; // "USE" 또는 "SAVE"
        private Integer price;
        private String content;
    }

    @Data
    public static class CouponDataDto {
        private Long coupon_id;
        private BigDecimal discount_amount;
    }

    @Data
    public static class ReservationDataDto {
        private Long stylist_id;
        private String reservation_date;
        private String reservation_time;
        private boolean is_paid;
        private String requirements;
        private Long service_menu_id;
    }
}