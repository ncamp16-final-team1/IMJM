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
    private String userId;
    private String username;
    private String profileUrl;
    private LocalDateTime regDate;
    private String content;
    private boolean isCommentForComment;
    private Long parentCommentId;
    private List<ArchiveCommentDto> childComments;
}
