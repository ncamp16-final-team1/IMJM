package com.IMJM.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationStylistDto {
    private String salonId;
    private Integer stylistId;
    private String name;
    private short holidayMask;
//    private List<String> holidays;
    private String introduction;
    private String profile;

    @Builder
    public ReservationStylistDto(String salonId, Integer stylistId, String name,
                                 short holidayMask,
                                 String introduction, String profile) {
        this.salonId = salonId;
        this.stylistId = stylistId;
        this.name = name;
        this.holidayMask = holidayMask;
//        this.holidays = holidays;
        this.introduction = introduction;
        this.profile = profile;
    }




}