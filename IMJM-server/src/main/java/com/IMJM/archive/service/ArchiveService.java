package com.IMJM.archive.service;

import com.IMJM.archive.dto.ArchiveCreateDto;
import com.IMJM.archive.repository.ArchivePhotosRepository;
import com.IMJM.archive.repository.ArchiveRepository;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchivePhotos;
import com.IMJM.common.entity.Users;
import com.IMJM.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

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
    public Long createArchive(ArchiveCreateDto archiveCreateDto, Long userId, List<MultipartFile> photos) {
        Users user = usersRepository.findById(String.valueOf(userId))
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Archive archive = Archive.builder()
                .user(user)
                .content(archiveCreateDto.getContent())
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
}