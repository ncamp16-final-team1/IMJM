package com.IMJM.user.service;

import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.ClientStylist;
import com.IMJM.common.entity.PointUsage;
import com.IMJM.common.entity.Users;
import com.IMJM.jwt.JWTUtil;
import com.IMJM.reservation.repository.PointUsageRepository;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.LocationDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.ClientStylistRepository;
import com.IMJM.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ClientStylistRepository stylistRepository;
    private final JWTUtil jwtUtil;
    private final ClientStylistRepository clientStylistRepository;
    private final PointUsageRepository pointUsageRepository;

    private static final String ANONYMOUS_USER = "anonymous";
    private static final BigDecimal LAT = new BigDecimal("37.498297");
    private static final BigDecimal LON = new BigDecimal("127.027733");
    private static final int MEMBERSHIP_POINT = 1000;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    @Transactional
    public void completeMemberRegistration(UserDto dto, MultipartFile profileFile, MultipartFile licenseFile) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();

        String usersId = null;

        if (principal instanceof CustomOAuth2UserDto users) {
            usersId = users.getId();
        }

        Users user = userRepository.findById(Objects.requireNonNull(usersId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        if (dto.getUserType().equals("STYLIST")){
            ClientStylist clientStylist = ClientStylist.builder()
                    .userId(user.getId())
                    .license(uploadProfileImage(usersId, licenseFile))
                    .salonName(dto.getSalonName())
                    .build();
            stylistRepository.save(clientStylist);
        }

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


        user.savePoint(MEMBERSHIP_POINT);
        PointUsage pointUsage = PointUsage.builder()
                .user(user)
                .usageType("SAVE")
                .price(MEMBERSHIP_POINT)
                .useDate(LocalDateTime.now())
                .content("Membership Points Earned")
                .build();

        pointUsageRepository.save(pointUsage);
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

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("Authorization", null);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        response.addCookie(cookie);
    }

    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        String token = jwtUtil.resolveUserToken(request);
        if (token == null || jwtUtil.isExpired(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"error\": \"Token expired or not provided\"}");
        }
        return ResponseEntity.ok().build();
    }

    public LocationDto getUserLocation(String userID) {
        // 로그인하지 않은 유저
        if (ANONYMOUS_USER.equals(userID)) {
            return LocationDto.builder()
                    .userId(userID)
                    .latitude(LAT)
                    .longitude(LON)
                    .build();
        }

        // 로그인했는데 위치값이 없는 경우
        Users user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        BigDecimal latitude = user.getLatitude();
        BigDecimal longitude = user.getLongitude();
        if (latitude == null || longitude == null) {
            return LocationDto.builder()
                    .userId(userID)
                    .latitude(LAT)
                    .longitude(LON)
                    .build();
        }

        return LocationDto.builder()
                .userId(userID)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }

    public void updateUserLocation(String userId, BigDecimal latitude, BigDecimal longitude) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        user.updateLocation(latitude, longitude);
        userRepository.save(user);
    }

    public void deleteAccount(String userid) {
        Users user = userRepository.findById(userid)
                .orElseThrow(() -> new RuntimeException("not found user"));

        String prefix = "user/" + userid + "/";
        try {
            storageService.deleteFolder(prefix);
        } catch (Exception e) {
            log.warn("S3 사용자 폴더 삭제 실패: {}", prefix, e);
        }

        if (user.getUserType().equals("STYLIST")) {
            clientStylistRepository.deleteById(userid);
        }

        user.deleteAccount();
    }

    public boolean isNicknameAvailable(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }
}
