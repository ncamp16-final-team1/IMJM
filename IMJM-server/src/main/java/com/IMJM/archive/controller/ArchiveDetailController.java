package com.IMJM.archive.controller;

import com.IMJM.archive.dto.ArchiveCommentDto;
import com.IMJM.archive.dto.ArchiveDetailDto;
import com.IMJM.archive.dto.ArchiveLikeDto;
import com.IMJM.archive.service.ArchiveDetailService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
public class ArchiveDetailController {

    private final ArchiveDetailService archiveDetailService;

    @GetMapping("/{id}")
    public ArchiveDetailDto getArchiveDetail(  // ResponseEntity 제거
                                               @PathVariable Long id,
                                               @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        String userId = customOAuth2UserDto != null ? customOAuth2UserDto.getId() : null;
        return archiveDetailService.getArchiveDetail(id, userId);  // 직접 DTO 반환
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ArchiveCommentDto> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String content = (String) request.get("content");
        Long parentCommentId = request.get("parentCommentId") != null
                ? Long.valueOf(request.get("parentCommentId").toString())
                : null;

        ArchiveCommentDto commentDto = archiveDetailService.addComment(
                id,
                customOAuth2UserDto.getId(),
                content,
                parentCommentId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(commentDto);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        archiveDetailService.deleteComment(commentId, customOAuth2UserDto.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        boolean isLiked = archiveDetailService.toggleLike(id, customOAuth2UserDto.getId());
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }

    @GetMapping("/{id}/likes")
    public List<ArchiveLikeDto> getLikes(@PathVariable Long id) {  // ResponseEntity 제거
        return archiveDetailService.getLikes(id);  // 직접 리스트 반환
    }

    @GetMapping("/current-user")
    public ResponseEntity<Map<String, String>> getCurrentUser(
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Map<String, String> userData = Map.of("userId", customOAuth2UserDto.getId());

        return ResponseEntity.ok(userData);
    }
}