package com.IMJM.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "salon")
public class Salon {

    @Id
    @Column(length = 20, nullable = false)
    private String id;

    @Column(length = 100, nullable = false)
    private String password;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(name = "corp_reg_number", length = 20)
    private String corpRegNumber;

    @Column(length = 255)
    private String address;

    @Column(name = "detail_address")
    private String detailAddress;

    @Column(name = "call_number", length = 20)
    private String callNumber;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(name = "holiday_mask", nullable = false)
    @ColumnDefault("0")
    private Short holidayMask;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "time_unit")
    private Integer timeUnit;

    @Column(precision = 2, scale = 1)
    private BigDecimal score;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
}