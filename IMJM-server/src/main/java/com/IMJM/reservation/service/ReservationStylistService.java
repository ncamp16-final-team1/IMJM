package com.IMJM.reservation.service;

import com.IMJM.common.entity.AdminStylist;

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

    // 특정 살롱의 스타일리스트 목록 조회
    @Transactional(readOnly = true)
    public List<ReservationStylistDto> getStylistsBySalon(String salonId) {    // 특정 살롱의 스타일리스트 목록 조회
        return adminStylistRepository.findBySalonId(salonId).stream()// 살롱 ID로 스타일리스트 검색
                .map(this::convertAdminStylistToDto)    // 엔티티를 DTO로 변환
                .collect(Collectors.toList());  // 리스트로 수집
    }

    // 엔티티를 DTO로 변환하는 정적 메서드
    public ReservationStylistDto convertAdminStylistToDto(AdminStylist adminStylist) {
        return ReservationStylistDto.builder()
                .adminStylist(adminStylist)
                .build();
    }

    public StylistAndSalonDetailsDto getStylistAndSalonDetails(Long stylistId) {
        return adminStylistRepository.findByStylistId(stylistId)
                .map(this::convertStylistAndSalonDetail)
                .orElseThrow(() -> new EntityNotFoundException("해당 스타일리스트가 없습니다."));
    }

    public StylistAndSalonDetailsDto convertStylistAndSalonDetail(AdminStylist adminStylist){
        return StylistAndSalonDetailsDto.builder()
                .adminStylist(adminStylist)
                .build();
    }




}