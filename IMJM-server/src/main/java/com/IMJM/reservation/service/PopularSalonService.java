package com.IMJM.reservation.service;

import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.common.entity.Salon;
import com.IMJM.common.entity.SalonPhotos;
import com.IMJM.reservation.dto.PopularSalonDto;
import com.IMJM.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopularSalonService {

    private final ReservationRepository reservationRepository;
    private final SalonPhotosRepository salonPhotosRepository;

    public List<PopularSalonDto> getTop5PopularSalons() {
        PageRequest pageRequest = PageRequest.of(0, 5);
        Page<Object[]> popularSalons = reservationRepository.findPopularSalonsByReservationCount(pageRequest);

        return popularSalons.getContent().stream()
                .map(result -> {
                    Salon salon = (Salon) result[0];
                    Long reservationCount = (Long) result[1];

                    String firstPhotoUrl = salonPhotosRepository
                            .findBySalon_IdOrderByPhotoOrderAsc(salon.getId())
                            .stream()
                            .findFirst()
                            .map(SalonPhotos::getPhotoUrl)
                            .orElse(null);

                    return PopularSalonDto.builder()
                            .id(salon.getId())
                            .name(salon.getName())
                            .address(salon.getAddress())
                            .score(salon.getScore() != null ? salon.getScore().doubleValue() : null)
                            .reservationCount(reservationCount)
                            .photoUrl(firstPhotoUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }
}