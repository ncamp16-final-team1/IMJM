package com.IMJM.admin.service;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.Salon;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.SalonPhotos;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
public class AdminJoinService {

    private final SalonRepository salonRepository;
    private final SalonPhotosRepository salonPhotosRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final StorageService storageService;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    public SalonDto selectSalonById(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        Salon salon = salonRepository.findById(salonDetails.getSalon().getId())
                .orElseThrow(() -> new IllegalArgumentException("미용실 정보를 찾을 수 없습니다."));

        return SalonDto.from(salon);
    }

    public void joinProcess(SalonDto joinDTO, List<MultipartFile> photos) {

        if (salonRepository.existsById(joinDTO.getId())) {
            return;
        }

        Salon salon = Salon.builder()
                .id(joinDTO.getId())
                .password(bCryptPasswordEncoder.encode(joinDTO.getPassword()))
                .name(joinDTO.getName())
                .corpRegNumber(joinDTO.getCorpRegNumber())
                .address(joinDTO.getAddress())
                .detailAddress(joinDTO.getDetailAddress())
                .callNumber(joinDTO.getCallNumber())
                .introduction(joinDTO.getIntroduction())
                .holidayMask(joinDTO.getHolidayMask())
                .startTime(joinDTO.getStartTime())
                .endTime(joinDTO.getEndTime())
                .timeUnit(joinDTO.getTimeUnit())
                .latitude(joinDTO.getLatitude())
                .longitude(joinDTO.getLongitude())
                .build();

        salonRepository.save(salon);

        uploadSalonPhotos(salon, photos);
    }

    @Transactional
    public void updateProcess(String salonId, SalonDto salonUpdateDto, List<MultipartFile> photos) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("미용실이 존재하지 않습니다."));

        salon.updateInfo(salonUpdateDto);

        uploadSalonPhotos(salon, photos);
    }

    @Transactional
    private void uploadSalonPhotos(Salon salon, List<MultipartFile> photos) {
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

                    String s3Path = "salon/" + salon.getId() + "/" + fileName;

                    storageService.upload(s3Path, photo.getInputStream());

                    String photoUrl = baseUrl + "/" + s3Path;

                    salonPhotosRepository.save(SalonPhotos.builder()
                            .salon(salon)
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

    public boolean checkId(String id) {
        return !salonRepository.existsById(id);
    }
}