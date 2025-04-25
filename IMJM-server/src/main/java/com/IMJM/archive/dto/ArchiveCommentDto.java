package com.IMJM.archive.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchiveCommentDto {
    private Long id;
    private Long archiveId;
    private Long userId;
    private String username;
    private LocalDateTime regDate;
    private String content;
    private boolean isCommentForComment;
    private Long parentCommentId;
    private List<ArchiveCommentDto> childComments;
}
