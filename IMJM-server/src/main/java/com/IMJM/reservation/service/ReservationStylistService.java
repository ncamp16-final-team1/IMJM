package com.IMJM.reservation.service;

import com.IMJM.admin.repository.CouponRepository;
import com.IMJM.admin.repository.ReservationCouponRepository;
import com.IMJM.admin.repository.ServiceMenuRepository;
import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.service.ChatService;
import com.IMJM.common.entity.*;
import com.IMJM.reservation.dto.*;
import com.IMJM.reservation.repository.AdminStylistRepository;
import com.IMJM.reservation.repository.PaymentRepository;
import com.IMJM.reservation.repository.PointUsageRepository;
import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class ReservationStylistService {
    private final AdminStylistRepository adminStylistRepository;

    private final ReservationRepository reservationRepository;

    private final ServiceMenuRepository serviceMenuRepository;

    private final CouponRepository couponRepository;

    private final ReservationCouponRepository reservationCouponRepository;

    private final UserRepository userRepository;

    private final PaymentRepository paymentRepository;

    private final PointUsageRepository pointUsageRepository;

    private final ChatService chatService;

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

    @Transactional(readOnly = true)
    public Map<String, List<String>> getAvailableAndBookedTimeMap(Long stylistId, LocalDate date) {
        AdminStylist stylist = adminStylistRepository.findById(stylistId)
                .orElseThrow(() -> new RuntimeException("스타일리스트를 찾을 수 없습니다."));

        LocalTime salonStart = stylist.getSalon().getStartTime();
        LocalTime salonEnd = stylist.getSalon().getEndTime();

        LocalTime stylistStart = stylist.getStartTime();
        LocalTime stylistEnd = stylist.getEndTime();

        int timeUnit = stylist.getSalon().getTimeUnit();

        LocalTime startTime = stylistStart.isBefore(salonStart) ? salonStart : stylistStart;
        LocalTime endTime = stylistEnd.isAfter(salonEnd) ? salonEnd : stylistEnd;

        List<LocalTime> bookedTimes = reservationRepository.findBookedTimesByStylistAndDate(stylistId, date);
        Set<LocalTime> bookedTimeSet = new HashSet<>(bookedTimes);

        List<String> availableTimes = new ArrayList<>();
        List<String> bookedTimesFormatted = bookedTimes.stream()
                .map(time -> time.format(DateTimeFormatter.ofPattern("HH:mm")))
                .toList();

        LocalTime current = startTime;
        while (current.plusMinutes(timeUnit).minusNanos(1).isBefore(endTime)) {
            if (!bookedTimeSet.contains(current)) {
                availableTimes.add(current.format(DateTimeFormatter.ofPattern("HH:mm")));
            }
            current = current.plusMinutes(timeUnit);
        }

        Map<String, List<String>> result = new HashMap<>();
        result.put("availableTimes", availableTimes);
        result.put("bookedTimes", bookedTimesFormatted);

        return result;
    }

    public List<ReservationServiceMenuDto> getServiceMenusBySalonId(String salonId) {
        List<ServiceMenu> menus = serviceMenuRepository.findBySalonId(salonId);

        return menus.stream()
                .map(menu -> new ReservationServiceMenuDto(
                        menu.getId(),
                        menu.getServiceType(),
                        menu.getServiceName(),
                        menu.getServiceDescription(),
                        menu.getPrice(),
                        menu.getSalon().getId()
                ))
                .collect(Collectors.toList());
    }

    public List<SalonCouponDto> getCoupons(String salonId, int totalAmount, String userId) {
        log.info("쿠폰 조회 파라미터 - salonId: {}, totalAmount: {}, userId: {}", salonId, totalAmount, userId);
        List<Coupon> coupons = couponRepository.findBySalonId(salonId);
        log.info("조회된 쿠폰 개수: {}", coupons.size());

        List<ReservationCoupon> usedCoupons = reservationCouponRepository
                .findByReservation_User_idAndCoupon_Salon_id(userId, salonId);

        Set<Long> usedCouponIds = usedCoupons.stream()
                .map(rc -> rc.getCoupon().getId())
                .collect(Collectors.toSet());

        LocalDate now = LocalDate.now();

        List<SalonCouponDto> couponDtos = coupons.stream()
                .map(coupon -> {
                    boolean meetsMinPurchase = coupon.getMinimumPurchase() <= totalAmount;
                    boolean isActive = coupon.getIsActive();
                    boolean isWithinValidPeriod = !coupon.getStartDate().toLocalDate().isAfter(now)
                            && !coupon.getExpiryDate().toLocalDate().isBefore(now);
                    boolean notUsedBefore = !usedCouponIds.contains(coupon.getId());

                    boolean isAvailable = meetsMinPurchase && isActive && isWithinValidPeriod && notUsedBefore;

                    return SalonCouponDto.builder()
                            .couponId(coupon.getId())
                            .couponName(coupon.getName())
                            .discountType(coupon.getDiscountType())
                            .discountValue(coupon.getDiscountValue())
                            .minimumPurchase(coupon.getMinimumPurchase())
                            .startDate(coupon.getStartDate())
                            .expiryDate(coupon.getExpiryDate())
                            .isActive(coupon.getIsActive())
                            .isAvailable(isAvailable)
                            .totalAmount(totalAmount)
                            .build();
                })
                .collect(Collectors.toList());

        couponDtos.sort((a, b) -> Boolean.compare(b.getIsAvailable(), a.getIsAvailable()));

        return couponDtos;
    }

    public UserPointDto getUserPoint(String userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(userId));
        return new UserPointDto(user.getId(), user.getPoint());
    }


    @Transactional
    public ReservationRequestDto completeReservation(ReservationRequestDto request, String userId) {
        log.info("예약 완료 처리 시작: {}", request);

        try {

            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            AdminStylist stylist = adminStylistRepository.findById(request.getPaymentRequest().getReservation().getStylistId())
                    .orElseThrow(() -> new RuntimeException("스타일리스트를 찾을 수 없습니다."));

            ServiceMenu serviceMenu = serviceMenuRepository.findById(request.getPaymentRequest().getReservation().getServiceMenuId())
                    .orElseThrow(() -> new RuntimeException("서비스 메뉴를 찾을 수 없습니다."));

            Reservation reservation = createReservation(request, user, stylist, serviceMenu);
            Reservation savedReservation = reservationRepository.save(reservation);
            log.info("예약 정보 저장 완료. 예약 ID: {}", savedReservation.getId());

            Payment payment = createPayment(request, savedReservation);
            Payment savedPayment = paymentRepository.save(payment);
            log.info("결제 정보 저장 완료. 결제 ID: {}", savedPayment.getId());

            int rewardPoint = 100;
            user.savePoint(rewardPoint);
            userRepository.save(user);

            PointUsage rewardLog = PointUsage.builder()
                    .user(user)
                    .usageType("SAVE")
                    .price(rewardPoint)
                    .useDate(LocalDateTime.now())
                    .content(stylist.getSalon().getName() + " 예약 포인트")
                    .build();

            pointUsageRepository.save(rewardLog);
            log.info("예약 완료 포인트 지급 완료: {}포인트", rewardPoint);

            if (request.getPaymentInfo().getPointUsed() > 0) {
                processPointUsage(request, user);
                updateUserPoints(user, request.getPaymentInfo().getPointUsed());
            }

            if (request.getPaymentRequest().getCouponData() != null) {
                processCouponUsage(request, savedReservation);
            }
            
            String salonId = stylist.getSalon().getId();
            log.info("예약 완료 후 채팅방 생성 시작 - 사용자: {}, 미용실: {}", userId, salonId);

            // 채팅방 생성 (이미 존재하면 기존 채팅방 반환됨)
            ChatRoomDto chatRoom = chatService.getChatRoom(userId, salonId);
            log.info("채팅방 생성 완료. 채팅방 ID: {}", chatRoom.getId());

            // 예약 완료 환영 메시지 전송
            LocalDate reservationDate = LocalDate.parse(request.getPaymentRequest().getReservation().getReservationDate());
            LocalTime reservationTime = LocalTime.parse(request.getPaymentRequest().getReservation().getReservationTime());
            String serviceName = serviceMenu.getServiceName();

            // 미용실에서 사용자에게 보내는 메시지
            String welcomeMessage = String.format(
                    "안녕하세요! 예약이 완료되었습니다.\n" +
                            "예약 일시: %s월 %s일 %s시\n" +
                            "담당 스타일리스트: %s\n" +
                            "시술 종류: %s\n" +
                            "문의 사항이 있으시면 언제든지 채팅으로 연락주세요😊",
                    reservationDate.getMonthValue(),
                    reservationDate.getDayOfMonth(),
                    reservationTime.getHour(),
                    stylist.getName(),
                    serviceName
            );

            ChatMessageDto messageDto = ChatMessageDto.builder()
                    .chatRoomId(chatRoom.getId())
                    .senderType("SALON") // 미용실에서 보내는 메시지
                    .senderId(salonId)
                    .message(welcomeMessage)
                    .photos(new ArrayList<>()) // 빈 사진 목록
                    .build();

            chatService.sendMessage(messageDto);

            return request;
        } catch (Exception e) {
            log.error("예약 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("예약 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }


    private Reservation createReservation(ReservationRequestDto request, Users user, AdminStylist stylist, ServiceMenu serviceMenu) {
        var reservationData = request.getPaymentRequest().getReservation();

        LocalDate reservationDate = LocalDate.parse(reservationData.getReservationDate());
        LocalTime reservationTime = LocalTime.parse(reservationData.getReservationTime());

        return Reservation.builder()
                .user(user)
                .stylist(stylist)
                .serviceMenu(serviceMenu)
                .reservationDate(reservationDate)
                .reservationTime(reservationTime)
                .reservationServiceType(serviceMenu.getServiceType())
                .reservationServiceName(serviceMenu.getServiceName())
                .reservationPrice(serviceMenu.getPrice())
                .isPaid(true)
                .requirements(reservationData.getRequirements())
                .build();
    }

    private Payment createPayment(ReservationRequestDto request, Reservation reservation) {
        return Payment.builder()
                .reservation(reservation)
                .price(request.getPaymentRequest().getPrice().intValue())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentStatus())
                .transactionId("TRANS_" + System.currentTimeMillis())
                .paymentDate(LocalDateTime.now())
                .isCanceled(false)
                .isRefunded(false)
                .build();
    }

    private void processPointUsage(ReservationRequestDto request, Users user) {
        var pointUsageData = request.getPaymentRequest().getPointUsage();

        PointUsage pointUsage = PointUsage.builder()
                .user(user)
                .usageType(pointUsageData.getUsageType())
                .price(pointUsageData.getPrice())
                .useDate(LocalDateTime.now())
                .content(pointUsageData.getContent())
                .build();

        pointUsageRepository.save(pointUsage);
        log.info("포인트 사용 내역 저장 완료. 사용 포인트: {}", pointUsageData.getPrice());
    }

    private void updateUserPoints(Users user, int usedPoints) {
        int currentPoints = user.getPoint();
        int newPoints = currentPoints - usedPoints;

        if (newPoints < 0) {
            throw new IllegalArgumentException("사용 가능한 포인트보다 많은 포인트를 사용할 수 없습니다.");
        }

        userRepository.updatePoints(user.getId(), newPoints);

        log.info("사용자 포인트 업데이트: {} -> {}", currentPoints, newPoints);
    }

    private void processCouponUsage(ReservationRequestDto request, Reservation reservation) {
        var couponData = request.getPaymentRequest().getCouponData();

        Coupon coupon = couponRepository.findById(couponData.getCouponId())
                .orElseThrow(() -> new RuntimeException("쿠폰을 찾을 수 없습니다: " + couponData.getCouponId()));

        ReservationCoupon reservationCoupon = ReservationCoupon.builder()
                .reservation(reservation)
                .coupon(coupon)
                .discountAmount(couponData.getDiscountAmount().intValue())
                .build();

        reservationCouponRepository.save(reservationCoupon);
        log.info("쿠폰 사용 내역 저장 완료. 쿠폰 ID: {}, 할인 금액: {}",
                couponData.getCouponId(), couponData.getDiscountAmount());
    }
}