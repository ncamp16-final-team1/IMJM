package com.IMJM.common.entity;

import com.IMJM.admin.dto.CouponDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "coupon")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // "percentage" or "fixed"

    @Column(name = "discount_value", nullable = false)
    private Integer discountValue;

    @Column(name = "minimum_purchase", nullable = false)
    private Integer minimumPurchase;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public void updateCoupon(CouponDto couponDto){
        this.name = couponDto.getName();
        this.discountType = couponDto.getDiscountType();
        this.discountValue = couponDto.getDiscountValue();
        this.minimumPurchase = couponDto.getMinimumPurchase();
        this.startDate = couponDto.getStartDate().atStartOfDay();
        this.expiryDate = couponDto.getExpiryDate().atStartOfDay();
        this.isActive = couponDto.getIsActive();
    }
}