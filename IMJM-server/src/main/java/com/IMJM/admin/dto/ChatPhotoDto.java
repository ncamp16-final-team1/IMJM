package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatPhotoDto {
    private Long photoId;
    private String photoUrl;
}