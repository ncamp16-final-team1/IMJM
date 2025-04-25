package com.IMJM.archive.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchivePhotosDto {
    private Long photoId;
    private Long archiveId;
    private String photoUrl;
    private int photoOrder;
    private LocalDateTime uploadDate;
}
