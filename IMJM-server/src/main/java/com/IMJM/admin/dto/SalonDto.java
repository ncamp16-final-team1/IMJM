package com.IMJM.admin.dto;

import com.IMJM.common.entity.Salon;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalonDto {

    private String id;
    private String password;
    private String name;
    private String corpRegNumber;
    private String address;
    private String callNumber;
    private String introduction;
    private Short holidayMask;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer timeUnit;
    private BigDecimal score;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public SalonDto(Salon salon) {
        this.id = salon.getId();
        this.password = salon.getPassword();
        this.name = salon.getName();
        this.corpRegNumber = salon.getCorpRegNumber();
        this.address = salon.getAddress();
        this.callNumber = salon.getCallNumber();
        this.introduction = salon.getIntroduction();
        this.holidayMask = salon.getHolidayMask();
        this.startTime = salon.getStartTime();
        this.endTime = salon.getEndTime();
        this.timeUnit = salon.getTimeUnit();
        this.score = salon.getScore();
        this.latitude = salon.getLatitude();
        this.longitude = salon.getLongitude();
    }
}