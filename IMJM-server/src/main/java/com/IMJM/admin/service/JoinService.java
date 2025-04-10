package com.IMJM.admin.service;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.common.entity.Salon;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.SalonPhotos;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class JoinService {

    private final SalonRepository salonRepository;
    private final SalonPhotosRepository salonPhotosRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(SalonRepository salonRepository,
                       SalonPhotosRepository salonPhotosRepository,
                       BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.salonRepository = salonRepository;
        this.salonPhotosRepository = salonPhotosRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public void joinProcess(SalonDto joinDTO, List<MultipartFile> photos) {

        String id = joinDTO.getId();
        String password = joinDTO.getPassword();

        if (salonRepository.existsById(id)) {
            return;
        }

        Salon salon = Salon.builder()
                .id(id)
                .password(bCryptPasswordEncoder.encode(password))
                .name(joinDTO.getName())
                .corpRegNumber(joinDTO.getCorpRegNumber())
                .address(joinDTO.getAddress())
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

        String uploadDir = new File("src/main/resources/static/images/salon").getAbsolutePath();

        int order = 0;
        for (MultipartFile photo : photos) {
            if (!photo.isEmpty()) {
                try {
                    String originalFilename = photo.getOriginalFilename();
                    String ext = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
                    String fileName = UUID.randomUUID() + ext;

                    File dest = new File(uploadDir, fileName);
                    photo.transferTo(dest);  // 저장

                    String photoUrl = "/images/salon/" + fileName;

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
}