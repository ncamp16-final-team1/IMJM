package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "point_usage")
public class PointUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "usage_type", length = 20, nullable = false)
    private String usageType;

    @Column(nullable = false)
    private int price;

    @Column(name = "use_date", nullable = false)
    private LocalDateTime useDate;

    @Column(length = 100, nullable = false)
    private String content;
}