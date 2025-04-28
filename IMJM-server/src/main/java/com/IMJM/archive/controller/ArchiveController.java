package com.IMJM.archive.controller;

import com.IMJM.archive.dto.ArchiveListDto;
import com.IMJM.archive.service.ArchiveService;
import com.IMJM.common.page.PageResponseDto;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    @GetMapping("/")
    public ResponseEntity<PageResponseDto<ArchiveListDto>> getArchiveList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
        PageResponseDto<ArchiveListDto> response = archiveService.getArchiveList(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/")
    public ResponseEntity<?> createArchive(
            @RequestPart("content") String content,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        if (customOAuth2UserDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요한 서비스입니다.");
        }

        try {
            String userId = customOAuth2UserDto.getId();
            Long archiveId = archiveService.createArchive(content, userId, photos);
            return ResponseEntity.status(HttpStatus.CREATED).body(archiveId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류가 발생했습니다: " + e.getMessage());
        }
    }
}