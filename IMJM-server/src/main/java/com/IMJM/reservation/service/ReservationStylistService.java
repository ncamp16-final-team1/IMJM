package com.IMJM.reservation.service;

import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.dto.StylistAndSalonDetailsDto;
import com.IMJM.reservation.repository.AdminStylistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationStylistService {
    private final AdminStylistRepository adminStylistRepository;

    @Transactional(readOnly = true)
    public List<ReservationStylistDto> getStylistsBySalon(String salonId) {
        return adminStylistRepository.findBySalonId(salonId).stream()
                .map(ReservationStylistDto::new)
                .collect(Collectors.toList());
    }

    public StylistAndSalonDetailsDto getStylistAndSalonDetails(Long stylistId) {
        return adminStylistRepository.findByStylistId(stylistId)
                .map(StylistAndSalonDetailsDto::new)
                .orElseThrow(() -> new EntityNotFoundException("해당 스타일리스트가 없습니다."));
    }




}