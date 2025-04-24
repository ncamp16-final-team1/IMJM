package com.IMJM.admin.service;

import com.IMJM.admin.dto.SalonPhotoDto;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.common.entity.SalonPhotos;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonPhotosService {

    private final SalonPhotosRepository salonPhotosRepository;

    public List<String> getPhotosBySalonId(String salonId) {
        return salonPhotosRepository.findBySalon_IdOrderByPhotoOrderAsc(salonId)
                .stream()
                .map(SalonPhotos::getPhotoUrl)
                .collect(Collectors.toList());
    }
    public List<SalonPhotoDto> getSalonPhotosBySalonId(String salonId) {
        return salonPhotosRepository.findBySalon_IdOrderByPhotoOrderAsc(salonId)
                .stream()
                .map(SalonPhotoDto::getSalonPhoto)
                .collect(Collectors.toList());
    }
}
