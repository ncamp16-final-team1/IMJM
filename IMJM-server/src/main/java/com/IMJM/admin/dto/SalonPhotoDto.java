package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalonPhotoDto {
    private String salonId;
    private String photoUrl;
    private int photoOrder;

}
