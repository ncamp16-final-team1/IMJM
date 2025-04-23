package com.IMJM.admin.service;

import com.IMJM.admin.dto.AdminStylistDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.AdminStylist;
import com.IMJM.common.entity.Salon;
import com.IMJM.reservation.repository.AdminStylistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminStylistService {

    private final AdminStylistRepository adminStylistRepository;
    private final SalonRepository salonRepository;
    private final StorageService storageService;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    public void adminStylistRegister(AdminStylistDto adminStylistDto, MultipartFile profileFile, CustomSalonDetails salonDto) {

        Salon salon = salonRepository.findById(salonDto.getSalon().getId())
                .orElseThrow(() -> new RuntimeException("미용실이 존재하지 않습니다."));

        String profileUrl = uploadProfileImage(salon.getId(), profileFile);

        AdminStylist adminStylist = AdminStylist.builder()
                .salon(salon)
                .name(adminStylistDto.getName())
                .callNumber(adminStylistDto.getCallNumber())
                .startTime(LocalTime.parse(adminStylistDto.getStartTime()))
                .endTime(LocalTime.parse(adminStylistDto.getEndTime()))
                .holidayMask(adminStylistDto.getHolidayMask())
                .profile(profileUrl)
                .introduction(adminStylistDto.getIntroduction())
                .build();

        adminStylistRepository.save(adminStylist);
    }

    public List<AdminStylistDto> getAllStylists(String id) {
        List<AdminStylist> adminStylists = adminStylistRepository.findBySalonId(id);

        return adminStylists.stream()
                .map(adminStylist -> AdminStylistDto.builder()
                        .stylistId(adminStylist.getStylistId())
                        .name(adminStylist.getName())
                        .callNumber(adminStylist.getCallNumber())
                        .profile(adminStylist.getProfile())
                        .holidayMask(adminStylist.getHolidayMask())
                        .introduction(adminStylist.getIntroduction())
                        .startTime(String.valueOf(adminStylist.getStartTime()))
                        .endTime(String.valueOf(adminStylist.getEndTime()))
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteStylist(Long stylistId) {
        AdminStylist stylist = adminStylistRepository.findById(stylistId)
                .orElseThrow(() -> new EntityNotFoundException("스타일리스트를 찾을 수 없습니다."));
        adminStylistRepository.delete(stylist);
    }

    public void updateStylist(Long stylistId, AdminStylistDto adminStylistDto, MultipartFile profileFile) {
        AdminStylist stylist = adminStylistRepository.findById(stylistId)
                .orElseThrow(() -> new EntityNotFoundException("Stylist not found with ID: " + stylistId));

        stylist.updateAdminStylist(adminStylistDto);

        if (profileFile != null) {
            String profileUrl = uploadProfileImage(stylist.getSalon().getId(), profileFile);
            stylist.updateProfile(profileUrl);
        }
    }

    public String uploadProfileImage(String salonId, MultipartFile profileFile) {
        if (profileFile == null || profileFile.isEmpty()) {
            return null;
        }

        String baseUrl = "https://" + bucketName + ".kr.object.ncloudstorage.com";

        try {
            String ext = Objects.requireNonNull(profileFile.getOriginalFilename())
                    .substring(profileFile.getOriginalFilename().lastIndexOf("."));
            String fileName = UUID.randomUUID() + ext;
            String s3Path = "salon/" + salonId + "/stylist/" + fileName;

            storageService.upload(s3Path, profileFile.getInputStream());

            return baseUrl + "/" + s3Path;
        } catch (IOException e) {
            throw new RuntimeException("프로필 업로드 실패", e);
        }
    }
}
