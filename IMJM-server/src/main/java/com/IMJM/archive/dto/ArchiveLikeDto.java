package com.IMJM.archive.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchiveLikeDto {
    private Long archiveId;
    private Long userId;
    private String username;
}