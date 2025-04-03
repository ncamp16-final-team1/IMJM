package com.IMJM.admin.dto;

import com.IMJM.admin.entity.HairSalon;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HairSalonDto {

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

    public HairSalonDto(HairSalon hairSalon) {
        this.id = hairSalon.getId();
        this.password = hairSalon.getPassword();
        this.name = hairSalon.getName();
        this.corpRegNumber = hairSalon.getCorpRegNumber();
        this.address = hairSalon.getAddress();
        this.callNumber = hairSalon.getCallNumber();
        this.introduction = hairSalon.getIntroduction();
        this.holidayMask = hairSalon.getHolidayMask();
        this.startTime = hairSalon.getStartTime();
        this.endTime = hairSalon.getEndTime();
        this.timeUnit = hairSalon.getTimeUnit();
        this.score = hairSalon.getScore();
        this.latitude = hairSalon.getLatitude();
        this.longitude = hairSalon.getLongitude();
    }
}