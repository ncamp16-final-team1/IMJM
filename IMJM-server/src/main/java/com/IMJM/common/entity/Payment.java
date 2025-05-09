package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false)
    private int price;

    @Column(name = "payment_method", length = 50, nullable = false)
    private String paymentMethod;

    @Column(name = "payment_status", length = 20, nullable = false)
    private String paymentStatus;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "payment_date")
    private OffsetDateTime paymentDate;

    @Column(name = "is_canceled")
    private boolean isCanceled;

    @Column(name = "canceled_amount", precision = 10, scale = 2)
    private BigDecimal canceledAmount;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "is_refunded")
    private boolean isRefunded;
}
