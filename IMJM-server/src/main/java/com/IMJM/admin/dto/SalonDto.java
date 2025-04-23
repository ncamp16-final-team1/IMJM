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
    private String confirmPassword;
    private String name;
    private String corpRegNumber;
    private String address;
    private String detailAddress;
    private String callNumber;
    private String introduction;
    private Short holidayMask;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer timeUnit;
    private BigDecimal score;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String detail_address;

    @Builder
    public SalonDto(Salon salon) {
        this.id = salon.getId();
        this.password = salon.getPassword();
        this.name = salon.getName();
        this.corpRegNumber = salon.getCorpRegNumber();
        this.address = salon.getAddress();
        this.detailAddress = salon.getDetailAddress();
        this.callNumber = salon.getCallNumber();
        this.introduction = salon.getIntroduction();
        this.holidayMask = salon.getHolidayMask();
        this.startTime = salon.getStartTime();
        this.endTime = salon.getEndTime();
        this.timeUnit = salon.getTimeUnit();
        this.score = salon.getScore();
        this.latitude = salon.getLatitude();
        this.longitude = salon.getLongitude();
        this.detail_address = salon.getDetailAddress();
    }

    public static SalonDto from(Salon salon) {
        return SalonDto.builder()
                .id(salon.getId())
                .name(salon.getName())
                .address(salon.getAddress())
                .detailAddress(salon.getDetailAddress())
                .callNumber(salon.getCallNumber())
                .introduction(salon.getIntroduction())
                .holidayMask(salon.getHolidayMask())
                .startTime(salon.getStartTime())
                .endTime(salon.getEndTime())
                .timeUnit(salon.getTimeUnit())
                .build();
    }
}