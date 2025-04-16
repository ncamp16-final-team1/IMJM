package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminStylistDto {
    private Long stylistId;
    private String salonId;
    private String name;
    private String callNumber;
    private String startTime;
    private String endTime;
    private Short holidayMask;
    private String profile;
    private String introduction;
}
