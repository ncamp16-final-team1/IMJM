package com.IMJM.reservation.service;

import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.entity.AdminStylist;
import com.IMJM.reservation.repository.ReservationStylistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StylistService {
    private final ReservationStylistRepository reservationStylistRepository;

    // 특정 살롱의 스타일리스트 조회
    @Transactional(readOnly = true)
    public List<ReservationStylistDto> getStylistsBySalon(String salonId) {    // 특정 살롱의 스타일리스트 목록 조회
        return reservationStylistRepository.findByHairSalonId(salonId).stream()// 살롱 ID로 스타일리스트 검색
                .map(this::convertToDto)    // 엔티티를 DTO로 변환
                .collect(Collectors.toList());  // 리스트로 수집
    }
    // 엔티티를 DTO로 변환하는 정적 메서드
    public  ReservationStylistDto convertToDto(AdminStylist adminStylist) {
        return ReservationStylistDto.builder()
                .salonId(adminStylist.getHairSalon().getId())
                .stylistId(adminStylist.getStylistId())
                .name(adminStylist.getName())
                .holidayMask(adminStylist.getHolidayMask())
//                .holidays(calculateHolidays(stylist.getHolidayMask()))
                .introduction(adminStylist.getIntroduction())
                .profile(adminStylist.getProfile())
                .build();
    }

//    // 휴무일 계산 메서드
//    private static List<String> calculateHolidays(short holidayMask) {
//        List<String> holidays = new ArrayList<>();
//        String[] days = {"월", "화", "수", "목", "금", "토", "일"};
//
//        for (int i = 0; i < days.length; i++) {
//            if ((holidayMask & (1 << i)) > 0) {
//                holidays.add(days[i]);
//            }
//        }
//
//        return holidays;
//    }

   public ReservationStylistDto getStylistById(Integer stylistId){
       AdminStylist adminStylist = reservationStylistRepository.findById(stylistId)
               .orElseThrow(() -> new EntityNotFoundException("스타일리스트를 찾을 수 없습니다."));

       return convertToDto(adminStylist);
   }

}