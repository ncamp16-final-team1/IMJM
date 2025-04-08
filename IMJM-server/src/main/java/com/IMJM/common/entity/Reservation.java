package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "reservation", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"stylist_id", "reservation_date", "reservation_time"})
})
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;

    @Column(name = "service_type", length = 100, nullable = false)
    private String serviceType;

    @Column(name = "service_name", length = 100, nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private int price;

    @Column(name = "is_paid", nullable = false)
    private boolean isPaid;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stylist_id", nullable = false)
    private AdminStylist stylist;
}
