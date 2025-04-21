package com.IMJM.reservation.dto;


import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalonCouponDto {
    private Long couponId;
    private String couponName;
    private String discountType;
    private int discountValue;
    private int minimumPurchase;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private Boolean isAvailable;
    private int totalAmount;
}

