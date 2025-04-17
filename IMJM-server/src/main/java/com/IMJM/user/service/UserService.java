package com.IMJM.user.service;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.Users;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    @Transactional
    public void completeMemberRegistration(UserDto dto, MultipartFile profileFile) {

        log.info("전달된 userDto: {}", dto);
        log.info("전달된 프로필 파일: {}", profileFile != null ? profileFile.getOriginalFilename() : "없음");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();

        String usersId = null;

        if (principal instanceof CustomOAuth2UserDto users) {
            usersId = users.getId();
            log.info("일반 사용자 ID: {}", users.getUser().getId());
        } else if (principal instanceof CustomSalonDetails salon) {
            log.info("관리자 ID: {}", salon.getSalon().getId());
        }

        Users user = userRepository.findById(Objects.requireNonNull(usersId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        String profileUrl = uploadProfileImage(user.getId(), profileFile);

        user.updateUserType(dto.getUserType());

        user.updateDetailInfo(
                dto.getLanguage(),
                dto.getGender(),
                dto.getNickname(),
                profileUrl,
                LocalDate.parse(dto.getBirthday()),
                dto.getRegion(),
                dto.isIs_notification(),
                dto.isTermsAgreed());
    }

    public String uploadProfileImage(String userId, MultipartFile profileFile) {
        if (profileFile == null || profileFile.isEmpty()) {
            return null;
        }

        String baseUrl = "https://" + bucketName + ".kr.object.ncloudstorage.com";

        try {
            String ext = Objects.requireNonNull(profileFile.getOriginalFilename())
                    .substring(profileFile.getOriginalFilename().lastIndexOf("."));
            String fileName = UUID.randomUUID() + ext;
            String s3Path = "user/" + userId + "/" + fileName;

            storageService.upload(s3Path, profileFile.getInputStream());

            return baseUrl + "/" + s3Path;
        } catch (IOException e) {
            throw new RuntimeException("프로필 업로드 실패", e);
        }
    }
}
