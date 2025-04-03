package com.IMJM.reservation.service;

import com.IMJM.reservation.dto.StylistDto;
import com.IMJM.reservation.repository.StylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StylistService {
    private final StylistRepository stylistRepository;

    // 특정 살롱의 스타일리스트 조회
    @Transactional(readOnly = true)
    public List<StylistDto> getStylistsBySalon(String salonId) {    // 특정 살롱의 스타일리스트 목록 조회
        return stylistRepository.findByHairSalonId(salonId).stream()// 살롱 ID로 스타일리스트 검색
                .map(StylistDto::fromEntity)    // 엔티티를 DTO로 변환
                .collect(Collectors.toList());  // 리스트로 수집
    }


}