package com.IMJM.admin.service;

import com.IMJM.admin.dto.BlacklistDto;
import com.IMJM.admin.dto.ReservationCustomerDto;
import com.IMJM.admin.repository.BlacklistRepository;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.Blacklist;
import com.IMJM.common.entity.Reservation;
import com.IMJM.common.entity.Salon;
import com.IMJM.common.entity.Users;
import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerService {
    private final BlacklistRepository blacklistRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;

    public List<ReservationCustomerDto> allCustomers(String salonId) {
        List<Reservation> reservations = reservationRepository.findPastReservationsBySalonIdOrderByDateTimeDesc(salonId);

        Map<String, Long> visitCountMap = reservationRepository.countVisitByUserIds(
                reservations.stream()
                        .map(r -> r.getUser().getId())
                        .distinct()
                        .toList())
                .stream().collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));

        return reservations.stream()
                .map(reservation -> ReservationCustomerDto.builder()
                        .userId(reservation.getUser().getId())
                        .userName(reservation.getUser().getFirstName() + " " + reservation.getUser().getLastName())
                        .nickName(reservation.getUser().getNickname())
                        .serviceName("[" + reservation.getReservationServiceType()
                                + "] " + reservation.getReservationServiceName())
                        .reservationDate(reservation.getReservationDate())
                        .visitCount(visitCountMap.getOrDefault(reservation.getUser().getId(),0L).intValue())
                        .requirements(reservation.getRequirements())
                        .build())
                .collect(Collectors.toList());
    }

    public void blackCustomer(String userId, String salonId, BlacklistDto blacklistDto) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user"));

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid salon"));

        Blacklist blacklist = Blacklist.builder()
                .user(user)
                .salon(salon)
                .reason(blacklistDto.getReason())
                .blockedDate(LocalDateTime.now())
                .build();

        blacklistRepository.save(blacklist);
    }

    public void deleteBlackCustomer(String userId, String salonId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user"));

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid salon"));

        Blacklist blacklist = blacklistRepository.findByUserAndSalon(user, salon)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자는 블랙리스트에 없습니다."));

        blacklistRepository.delete(blacklist);
    }

    public List<BlacklistDto> allBlackCustomer(String salonId) {
        List<Blacklist> blacklists = blacklistRepository.findBySalonId(salonId);

        return blacklists.stream()
                .map(blacklist -> BlacklistDto.builder()
                        .userId(blacklist.getUser().getId())
                        .userName(blacklist.getUser().getFirstName() + " " + blacklist.getUser().getLastName())
                        .nickName(blacklist.getUser().getNickname())
                        .reason(blacklist.getReason())
                        .blockedDate(String.valueOf(blacklist.getBlockedDate()))
                        .build())
                .collect(Collectors.toList());
    }
}
