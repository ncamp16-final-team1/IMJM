package com.IMJM.reservation.dto;

import com.IMJM.reservation.entity.Stylist;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationStylistDto {
    private String salonId;
    private String stylistId;
    private String name;
    private short holidayMask;
    private String introduction;
    private String profile;

    @Builder
    public ReservationStylistDto(String salonId, String stylistId, String name,
                                 short holidayMask,
                                 String introduction, String profile) {
        this.salonId = salonId;
        this.stylistId = stylistId;
        this.name = name;
        this.holidayMask = holidayMask;
        this.introduction = introduction;
        this.profile = profile;
    }



    // 엔티티를 DTO로 변환하는 정적 메서드
    public static ReservationStylistDto fromEntity(Stylist stylist) {
        return ReservationStylistDto.builder()
                .salonId(stylist.getHairSalon().getId())
                .stylistId(stylist.getStylistId().getStylistId())
                .name(stylist.getName())
                .holidayMask(stylist.getHolidayMask())
                .introduction(stylist.getIntroduction())
                .profile(stylist.getProfile())
                .build();
    }
}