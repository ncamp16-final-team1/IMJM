package com.IMJM.salon.service;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.Salon;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonRepository salonRepository;

    public SalonDto getSalonById(String id) {
        Optional<Salon> salonData = salonRepository.findById(id);

        log.info("Fetching salon with ID: {}", id);
        log.info("Found salon: {}", salonData);

        // Optional이 비어 있는지 확인
        if (salonData.isPresent()) {
            Salon salon = salonData.get();
            return new SalonDto(salon);
        }

        return null; // 컨트롤러에서 널 체크 후 적절한 응답 반환
    }

    public List<SalonDto> getAllSalons() {
        log.info("getAllSalons 메서드 호출됨");

        List<Salon> salons = salonRepository.findAll();

        log.info("조회된 살롱 수: {}", salons);

        return salons.stream()
                .map(SalonDto::new)
                .collect(Collectors.toList());
    }
}
