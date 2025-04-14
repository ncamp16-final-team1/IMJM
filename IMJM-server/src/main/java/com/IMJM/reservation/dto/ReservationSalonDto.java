package com.IMJM.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class ReservationSalonDto {
    private String id;
    private String password;
    private String name;
    private String corpRegNumber;
    private String address;
    private String callNumber;
    private String introduction;
    private short holidayMask;
    private LocalTime startTime;
    private LocalTime endTime;
    private int timeUnit;
    private BigDecimal score;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Builder
    public ReservationSalonDto(String id, String password, String name, String corpRegNumber,
                               String address, String callNumber, String introduction, short holidayMask,
                               LocalTime startTime, LocalTime endTime, int timeUnit, BigDecimal score,
                               BigDecimal latitude, BigDecimal longitude) {
        this.id = id;
        this.password = password;
        this.name = name;
        this.corpRegNumber = corpRegNumber;
        this.address = address;
        this.callNumber = callNumber;
        this.introduction = introduction;
        this.holidayMask = holidayMask;
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeUnit = timeUnit;
        this.score = score;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
