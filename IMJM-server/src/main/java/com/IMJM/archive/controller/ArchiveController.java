package com.IMJM.archive.controller;

import com.IMJM.archive.dto.ArchiveCreateDto;
import com.IMJM.archive.service.ArchiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    @PostMapping("/")
    public ResponseEntity<?> createArchive(
            @RequestPart("archiveDto") ArchiveCreateDto archiveCreateDto,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        Long archiveId = archiveService.createArchive(archiveCreateDto, userId, photos);

        return ResponseEntity.status(HttpStatus.CREATED).body(archiveId);
    }
}