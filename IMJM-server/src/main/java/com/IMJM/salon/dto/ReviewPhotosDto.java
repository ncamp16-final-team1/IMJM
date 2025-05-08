package com.IMJM.salon.dto;

import com.IMJM.common.entity.ReviewPhotos;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewPhotosDto {

    private Long photoId;
    private String photoUrl;
    private int photoOrder;
    private OffsetDateTime uploadDate;

    public static ReviewPhotosDto getReviewPhotos(ReviewPhotos photo) {
        return ReviewPhotosDto.builder()
                .photoId(photo.getPhotoId())
                .photoUrl(photo.getPhotoUrl())
                .photoOrder(photo.getPhotoOrder())
                .uploadDate(photo.getUploadDate())
                .build();
    }

}
