package com.IMJM.chat.dto;

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
