package com.IMJM.salon.service;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.Salon;
import com.IMJM.user.dto.LocationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonRepository salonRepository;

    public SalonDto getSalonById(String id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("헤어샵이 존재하지 않습니다"));
        return new SalonDto(salon);
    }

    public Page<SalonDto> findNearbySalons(LocationDto location, Pageable pageable) {
        BigDecimal latitude = location.getLatitude();
        BigDecimal longitude = location.getLongitude();
        BigDecimal radius = new BigDecimal(500);

        Page<Salon> salons = salonRepository.findNearbySalons(latitude, longitude, radius, pageable);
        return salons.map(salon -> {
            SalonDto dto = new SalonDto(salon);
            dto.setDistance(calculateDistance(latitude, longitude, salon.getLatitude(), salon.getLongitude()));
            return dto;
        });
    }

    private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        final BigDecimal R = new BigDecimal(6371);
        BigDecimal latDistance = lat2.subtract(lat1).multiply(new BigDecimal(Math.PI)).divide(new BigDecimal(180), 10, BigDecimal.ROUND_HALF_UP);
        BigDecimal lonDistance = lon2.subtract(lon1).multiply(new BigDecimal(Math.PI)).divide(new BigDecimal(180), 10, BigDecimal.ROUND_HALF_UP);

        BigDecimal lat1Rad = lat1.multiply(new BigDecimal(Math.PI)).divide(new BigDecimal(180), 10, BigDecimal.ROUND_HALF_UP);
        BigDecimal lat2Rad = lat2.multiply(new BigDecimal(Math.PI)).divide(new BigDecimal(180), 10, BigDecimal.ROUND_HALF_UP);

        BigDecimal sinLatDistanceDiv2 = new BigDecimal(Math.sin(latDistance.doubleValue() / 2));
        BigDecimal sinLonDistanceDiv2 = new BigDecimal(Math.sin(lonDistance.doubleValue() / 2));
        BigDecimal cosLat1Rad = new BigDecimal(Math.cos(lat1Rad.doubleValue()));
        BigDecimal cosLat2Rad = new BigDecimal(Math.cos(lat2Rad.doubleValue()));

        BigDecimal a = sinLatDistanceDiv2.multiply(sinLatDistanceDiv2)
                .add(cosLat1Rad.multiply(cosLat2Rad)
                        .multiply(sinLonDistanceDiv2)
                        .multiply(sinLonDistanceDiv2));

        BigDecimal c = new BigDecimal(2 * Math.atan2(Math.sqrt(a.doubleValue()), Math.sqrt(1 - a.doubleValue())));

        return R.multiply(c);
    }
}