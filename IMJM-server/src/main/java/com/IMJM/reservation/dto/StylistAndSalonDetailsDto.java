package com.IMJM.reservation.dto;

import com.IMJM.common.entity.AdminStylist;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StylistAndSalonDetailsDto  {
    private Long stylistId;
    private String salonId;
    private String name;
    private String callNumber;
    private String introduction;
    private short salonHolidayMask;
    private short stylistHolidayMask;
    private String profile;

    @Builder
    public StylistAndSalonDetailsDto(AdminStylist adminStylist){
        this.stylistId = adminStylist.getStylistId();
        this.salonId = adminStylist.getSalon().getId();
        this.name = adminStylist.getName();
        this.callNumber = adminStylist.getCallNumber();
        this.introduction = adminStylist.getIntroduction();
        this.salonHolidayMask = adminStylist.getSalon().getHolidayMask();
        this.stylistHolidayMask = adminStylist.getHolidayMask();
        this.profile = adminStylist.getProfile();
    }

}
