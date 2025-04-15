package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}