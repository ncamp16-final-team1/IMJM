package com.IMJM.admin.dto;

import com.IMJM.common.entity.SalonPhotos;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalonPhotoDto {
    private String salonId;
    private String photoUrl;
    private int photoOrder;
    private OffsetDateTime uploadDate;

    public static SalonPhotoDto getSalonPhoto(SalonPhotos photo) {
        return SalonPhotoDto.builder()
                .salonId(photo.getSalon().getId())
                .photoUrl(photo.getPhotoUrl())
                .photoOrder(photo.getPhotoOrder())
                .uploadDate(photo.getUploadDate())
                .build();
    }

}


