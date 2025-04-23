package com.IMJM.admin.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalonPhotoDto {
    private String salonId;
    private String photoUrl;
    private int photoOrder;
    private LocalDateTime uploadDate;

}
