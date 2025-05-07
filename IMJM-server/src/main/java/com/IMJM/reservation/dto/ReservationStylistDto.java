package com.IMJM.reservation.dto;

import com.IMJM.common.entity.AdminStylist;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class ReservationStylistDto {
    private String salonId;
    private Long stylistId;
    private String name;
    private short holidayMask;
    private String introduction;
    private String profile;
    private String salonName;
    private boolean isBlacklisted;

    @Builder
    public ReservationStylistDto(AdminStylist adminStylist, boolean isBlacklisted) {
        this.salonId = adminStylist.getSalon().getId();
        this.stylistId = adminStylist.getStylistId();
        this.name = adminStylist.getName();
        this.holidayMask = adminStylist.getHolidayMask();
        this.introduction = adminStylist.getIntroduction();
        this.profile = adminStylist.getProfile();
        this.salonName = adminStylist.getSalon().getName();
        this.isBlacklisted = isBlacklisted;
    }

}