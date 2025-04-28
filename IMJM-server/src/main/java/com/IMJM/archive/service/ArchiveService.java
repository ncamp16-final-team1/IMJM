package com.IMJM.archive.service;

import com.IMJM.archive.dto.ArchiveListDto;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
                .regDate(LocalDateTime.now())
                .build();

        // 아카이브 저장
        Archive savedArchive = archiveRepository.save(archive);

        // 사진 업로드
        if (photos != null && !photos.isEmpty()) {
            uploadArchivePhotos(savedArchive, photos);
        }

        return savedArchive.getId();
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
                            .uploadDate(LocalDateTime.now())
                            .build());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 컨트롤러에서 호출되는 메서드
    public PageResponseDto<ArchiveListDto> getArchiveList(Pageable pageable) {
        // 두 가지 구현 방식을 제공합니다

        // 1. 각 아카이브별로 첫 번째 사진만 조회하는 방식
        return getArchiveListWithFirstPhotos(pageable);

        // 2. 최적화된 단일 쿼리 방식
        // return getArchiveListOptimized(pageable);
    }

    // 각 아카이브별로 첫 번째 사진만 조회하는 방식
    private PageResponseDto<ArchiveListDto> getArchiveListWithFirstPhotos(Pageable pageable) {
        Page<Archive> archivePage = archiveRepository.findAll(pageable);

        List<ArchiveListDto> archiveList = archivePage.getContent().stream()
                .map(archive -> {
                    // 각 아카이브의 첫 번째 사진만 조회
                    String thumbnailUrl = null;
                    ArchivePhotos firstPhoto = archivePhotosRepository.findFirstPhotoByArchiveId(archive.getId());
                    // 또는
                    // ArchivePhotos firstPhoto = archivePhotosRepository.findByArchiveIdAndPhotoOrder(archive.getId(), 0);

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

    // 최적화된 단일 쿼리 방식 (ArchiveRepository의 findAllWithFirstPhoto 메서드 사용)
    public PageResponseDto<ArchiveListDto> getArchiveListOptimized(Pageable pageable) {
        Page<Object[]> result = archiveRepository.findAllWithFirstPhoto(pageable);

        List<ArchiveListDto> archiveList = result.getContent().stream()
                .map(array -> {
                    Archive archive = (Archive) array[0];
                    String thumbnailUrl = (String) array[1];

                    return ArchiveListDto.builder()
                            .id(archive.getId())
                            .content(archive.getContent())
                            .regDate(archive.getRegDate())
                            .thumbnailUrl(thumbnailUrl)
                            .build();
                })
                .collect(Collectors.toList());

        return new PageResponseDto<>(archiveList, result);
    }
}