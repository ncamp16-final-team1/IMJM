package com.IMJM.archive.service;

import com.IMJM.archive.dto.ArchiveDto;
import com.IMJM.archive.dto.ArchiveListDto;
import com.IMJM.archive.dto.ArchiveUpdateRequest;
import com.IMJM.archive.repository.ArchivePhotosRepository;
import com.IMJM.archive.repository.ArchiveRepository;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchivePhotos;
import com.IMJM.common.entity.Users;
import com.IMJM.common.page.PageResponseDto;
import com.IMJM.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArchiveService {

    private final ArchiveRepository archiveRepository;
    private final UserRepository usersRepository;
    private final ArchivePhotosRepository archivePhotosRepository;
    private final StorageService storageService;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    @Transactional
    public Long createArchive(String content, String userId, List<MultipartFile> photos) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Archive archive = Archive.builder()
                .user(user)
                .content(content)
                .service(null)
                .gender(null)
                .color(null)
                .length(null)
                .regDate(OffsetDateTime.now())
                .build();

        Archive savedArchive = archiveRepository.save(archive);

        if (photos != null && !photos.isEmpty()) {
            uploadArchivePhotos(savedArchive, photos);
        }

        return savedArchive.getId();
    }

    @Transactional(readOnly = true)
    public PageResponseDto<ArchiveListDto> getArchiveList(Pageable pageable) {
        Page<Archive> archivePage = archiveRepository.findAll(pageable);

        List<ArchiveListDto> archiveList = archivePage.getContent().stream()
                .map(archive -> {
                    String thumbnailUrl = null;
                    ArchivePhotos firstPhoto = archivePhotosRepository.findFirstPhotoByArchiveId(archive.getId());

                    if (firstPhoto != null) {
                        thumbnailUrl = firstPhoto.getPhotoUrl();
                    }

                    return ArchiveListDto.builder()
                            .id(archive.getId())
                            .content(archive.getContent())
                            .regDate(archive.getRegDate())
                            .thumbnailUrl(thumbnailUrl)
                            .userId(archive.getUser().getId())
                            .build();
                })
                .collect(Collectors.toList());

        return new PageResponseDto<>(archiveList, archivePage);
    }

    @Transactional
    public void deleteArchive(Long archiveId, String userId) {
        try {

            List<ArchivePhotos> photos = archivePhotosRepository.findByArchiveIdOrderByPhotoOrderAsc(archiveId);

            for (ArchivePhotos photo : photos) {
                try {
                    String s3Path = extractS3PathFromUrl(photo.getPhotoUrl());
                    storageService.delete(s3Path);
                } catch (Exception e) {
                    log.error("Object Storage 파일 삭제 중 오류 발생: {}", e.getMessage(), e);
                }
            }

            archivePhotosRepository.deleteByArchiveId(archiveId);

            archiveRepository.deleteById(archiveId);

        } catch (Exception e) {
            log.error("아카이브 삭제 중 오류 발생", e);
            throw new RuntimeException("아카이브 삭제에 실패했습니다.", e);
        }
    }

    @Transactional
    public ArchiveDto updateArchive(Long archiveId, String userId, ArchiveUpdateRequest request) {
        Archive archive = findArchiveAndCheckOwnership(archiveId, userId);

        archive.setContent(request.getContent());

        // 1. 삭제할 사진
        if (request.getDeletePhotoIds() != null && !request.getDeletePhotoIds().isEmpty()) {
            for (Long photoId : request.getDeletePhotoIds()) {
                ArchivePhotos photo = archivePhotosRepository.findById(photoId).orElse(null);

                if (photo != null && photo.getArchive().getId().equals(archiveId)) {
                    // Object Storage에서 파일 삭제
                    try {
                        String s3Path = extractS3PathFromUrl(photo.getPhotoUrl());
                        storageService.delete(s3Path);
                    } catch (Exception e) {
                        log.error("Object Storage 파일 삭제 중 오류 발생: {}", e.getMessage());
                    }

                    // DB에서 삭제
                    archivePhotosRepository.delete(photo);
                }
            }
        }

        // 2. 사진 순서 업데이트
        if (request.getPhotoOrders() != null && !request.getPhotoOrders().isEmpty()) {
            for (Map.Entry<Long, Integer> entry : request.getPhotoOrders().entrySet()) {
                ArchivePhotos photo = archivePhotosRepository.findById(entry.getKey()).orElse(null);

                if (photo != null && photo.getArchive().getId().equals(archiveId)) {
                    photo.setPhotoOrder(entry.getValue());
                    archivePhotosRepository.save(photo);
                }
            }
        }

        Archive updatedArchive = archiveRepository.save(archive);

        List<String> photoUrls = archivePhotosRepository.findByArchiveIdOrderByPhotoOrderAsc(updatedArchive.getId())
                .stream()
                .map(ArchivePhotos::getPhotoUrl)
                .collect(Collectors.toList());

        return ArchiveDto.builder()
                .id(updatedArchive.getId())
                .userId(updatedArchive.getUser().getId())
                .username(updatedArchive.getUser().getNickname())
                .content(updatedArchive.getContent())
                .service(updatedArchive.getService())
                .gender(updatedArchive.getGender())
                .color(updatedArchive.getColor())
                .length(updatedArchive.getLength())
                .profileUrl(updatedArchive.getUser().getProfile())
                .regDate(updatedArchive.getRegDate())
                .photoUrls(photoUrls)
                .build();
    }

    @Transactional
    public List<String> addArchivePhotos(Long archiveId, String userId, List<MultipartFile> photos) {
        Archive archive = findArchiveAndCheckOwnership(archiveId, userId);

        // 현재 사진 개수 확인 (순서를 위해)
        int maxOrder = 0;
        List<ArchivePhotos> existingPhotos = archivePhotosRepository.findByArchiveIdOrderByPhotoOrderAsc(archiveId);
        if (!existingPhotos.isEmpty()) {
            maxOrder = existingPhotos.stream()
                    .mapToInt(ArchivePhotos::getPhotoOrder)
                    .max()
                    .orElse(0);
        }

        List<String> photoUrls = new ArrayList<>();
        int order = maxOrder + 1;

        String baseUrl = "https://" + bucketName + ".kr.object.ncloudstorage.com";

        for (MultipartFile photo : photos) {
            if (!photo.isEmpty()) {
                try {
                    String originalFilename = photo.getOriginalFilename();
                    String ext = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
                    String uuid = UUID.randomUUID().toString();
                    String fileName = uuid + ext;

                    String s3Path = "archive/" + archive.getId() + "/" + fileName;

                    storageService.upload(s3Path, photo.getInputStream());

                    String photoUrl = baseUrl + "/" + s3Path;

                    // DB에 저장
                    ArchivePhotos archivePhoto = ArchivePhotos.builder()
                            .archive(archive)
                            .photoUrl(photoUrl)
                            .photoOrder(order++)
                            .uploadDate(OffsetDateTime.now())
                            .build();

                    archivePhotosRepository.save(archivePhoto);
                    photoUrls.add(photoUrl);
                } catch (Exception e) {
                    log.error("사진 업로드 중 오류 발생: {}", e.getMessage());
                    throw new RuntimeException("사진 업로드 중 오류가 발생했습니다.", e);
                }
            }
        }

        return photoUrls;
    }

    private Archive findArchiveAndCheckOwnership(Long archiveId, String userId) {
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new EntityNotFoundException("아카이브를 찾을 수 없습니다."));

        if (!archive.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("해당 아카이브에 대한 권한이 없습니다.");
        }

        return archive;
    }

    private void uploadArchivePhotos(Archive archive, List<MultipartFile> photos) {
        if (photos == null || photos.isEmpty()) return;

        String baseUrl = "https://" + bucketName + ".kr.object.ncloudstorage.com";
        int order = 0;

        for (MultipartFile photo : photos) {
            if (!photo.isEmpty()) {
                try {
                    String originalFilename = photo.getOriginalFilename();
                    String ext = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
                    String uuid = UUID.randomUUID().toString();
                    String fileName = uuid + ext;

                    String s3Path = "archive/" + archive.getId() + "/" + fileName;

                    storageService.upload(s3Path, photo.getInputStream());

                    String photoUrl = baseUrl + "/" + s3Path;

                    archivePhotosRepository.save(ArchivePhotos.builder()
                            .archive(archive)
                            .photoUrl(photoUrl)
                            .photoOrder(order++)
                            .uploadDate(OffsetDateTime.now())
                            .build());
                } catch (IOException e) {
                    log.error("사진 업로드 중 오류 발생: {}", e.getMessage());
                }
            }
        }
    }

    private String extractS3PathFromUrl(String photoUrl) {
        try {
            URL url = new URL(photoUrl);
            String path = url.getPath();
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (MalformedURLException e) {
            log.error("URL 파싱 오류: {}", e.getMessage());
            String domainPart = "ncloudstorage.com/";
            int startIndex = photoUrl.indexOf(domainPart);
            if (startIndex > 0) {
                return photoUrl.substring(startIndex + domainPart.length());
            }
            return "";
        }
    }

    // ArchiveService.java
    @Transactional(readOnly = true)
    public PageResponseDto<ArchiveListDto> getTrendingArchives(Pageable pageable) {
        Page<Archive> archivePage = archiveRepository.findTopByLikesCount(pageable);

        List<ArchiveListDto> archiveList = archivePage.getContent().stream()
                .map(archive -> {
                    String thumbnailUrl = null;
                    ArchivePhotos firstPhoto = archivePhotosRepository.findFirstPhotoByArchiveId(archive.getId());

                    if (firstPhoto != null) {
                        thumbnailUrl = firstPhoto.getPhotoUrl();
                    }

                    return ArchiveListDto.builder()
                            .id(archive.getId())
                            .content(archive.getContent())
                            .regDate(archive.getRegDate())
                            .thumbnailUrl(thumbnailUrl)
                            .build();
                })
                .collect(Collectors.toList());

        return new PageResponseDto<>(archiveList, archivePage);
    }
}