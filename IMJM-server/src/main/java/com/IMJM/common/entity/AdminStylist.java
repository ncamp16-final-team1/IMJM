package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "admin_stylist")
public class AdminStylist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stylist_id")
    private Long stylistId;

    @Column(length = 10, nullable = false)
    private String name;

    @Column(name = "call_number", length = 20)
    private String callNumber;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "holiday_mask", nullable = false)
    private short holidayMask;

    @Column(length = 255)
    private String profile;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;
}