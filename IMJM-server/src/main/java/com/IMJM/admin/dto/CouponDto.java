package com.IMJM.admin.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CouponDto {
    private Long id;
    private String name;
    private String discountType;
    private int discountValue;
    private int minimumPurchase;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Boolean isActive;
    private LocalDateTime createAt;
    private int useCount;

    public Boolean isIsActive() {
        return isActive;
    }
}
