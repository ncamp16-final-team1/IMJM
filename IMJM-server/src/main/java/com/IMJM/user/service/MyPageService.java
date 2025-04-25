package com.IMJM.user.service;

import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.user.dto.UserReservationResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class MyPageService {
    private final ReservationRepository reservationRepository;

    //유저의 예약리스트 조회
    public List<UserReservationResponseDto> getUserReservations(String userId) {
        List<Object[]> results = reservationRepository.findByUser_IdNative(userId);

        return results.stream()
                .map(UserReservationResponseDto::new) // Object[] -> DTO 변환
                .collect(Collectors.toList());
    }

}
