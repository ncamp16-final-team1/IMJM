package com.IMJM.archive.controller;

import com.IMJM.archive.dto.ArchiveDto;
import com.IMJM.archive.dto.ArchiveListDto;
import com.IMJM.archive.dto.ArchiveUpdateRequest;
import com.IMJM.archive.service.ArchiveService;
import com.IMJM.common.page.PageResponseDto;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
@Slf4j
public class ArchiveController {

    private final ArchiveService archiveService;

    @GetMapping("/")
    public PageResponseDto<ArchiveListDto> getArchiveList(  // ResponseEntity 제거
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
        return archiveService.getArchiveList(pageable);  // 직접 DTO 반환
    }

    @PostMapping("/")
    public Long createArchive(  // ResponseEntity 제거
                                @RequestPart("content") String content,
                                @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
                                @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            throw new RuntimeException("로그인이 필요합니다.");  // 예외 처리 방식 변경
        }

        return archiveService.createArchive(content, customOAuth2UserDto.getId(), photos);
    }

    @PutMapping("/{id}")
    public ArchiveDto updateArchive(  // ResponseEntity 제거
                                      @PathVariable Long id,
                                      @RequestBody ArchiveUpdateRequest request,
                                      @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            throw new RuntimeException("로그인이 필요합니다.");  // 예외 처리 방식 변경
        }

        return archiveService.updateArchive(id, customOAuth2UserDto.getId(), request);
    }

    @PostMapping("/{id}/photos")
    public List<String> addArchivePhotos(  // ResponseEntity 제거
                                           @PathVariable Long id,
                                           @RequestParam("photos") List<MultipartFile> photos,
                                           @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            throw new RuntimeException("로그인이 필요합니다.");  // 예외 처리 방식 변경
        }

        return archiveService.addArchivePhotos(id, customOAuth2UserDto.getId(), photos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArchive(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        try {
            if (customOAuth2UserDto == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "로그인이 필요합니다."));
            }

            archiveService.deleteArchive(id, customOAuth2UserDto.getId());
            return ResponseEntity.ok().build();

        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "삭제 권한이 없습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "아카이브 삭제 중 오류가 발생했습니다."));
        }
    }
}