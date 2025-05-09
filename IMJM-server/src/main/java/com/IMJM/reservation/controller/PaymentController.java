package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.PaymentApprovalRequestDto;
import com.IMJM.reservation.dto.PaymentResponseDto;
import com.IMJM.reservation.dto.PaymentStatusResponseDto;
import com.IMJM.reservation.dto.ReservationRequestDto;
import com.IMJM.reservation.service.PaymentService;
import com.IMJM.reservation.service.ReservationStylistService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final ReservationStylistService reservationStylistService;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, Boolean> paymentProcessingLocks = new ConcurrentHashMap<>();

    @PostMapping("/approve")
    public ResponseEntity<?> approvePayment(
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        String lockKey = null;
        try {
            String userId = customOAuth2UserDto.getId();
            String encodedData = requestBody.get("encodedData");

            if (encodedData == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "인코딩된 데이터가 없습니다."));
            }

            String decodedString = new String(Base64.getDecoder().decode(encodedData));
            log.debug("디코딩된 데이터: {}", decodedString);

            PaymentApprovalRequestDto approvalRequest = paymentService.parsePaymentRequest(decodedString);
            log.debug("처리할 결제 요청: paymentKey={}, orderId={}, amount={}",
                    approvalRequest.getPaymentKey(),
                    approvalRequest.getOrderId(),
                    approvalRequest.getAmount());

            lockKey = approvalRequest.getPaymentKey();
            if (Boolean.TRUE.equals(paymentProcessingLocks.putIfAbsent(lockKey, Boolean.TRUE))) {
                log.warn("이미 처리 중인 결제 요청입니다: paymentKey={}", approvalRequest.getPaymentKey());

                try {
                    PaymentStatusResponseDto status = paymentService.getPaymentStatus(approvalRequest.getPaymentKey());
                    log.info("결제 상태 확인: paymentKey={}, status={}", approvalRequest.getPaymentKey(), status.getStatus());

                    if ("DONE".equals(status.getStatus())) {

                        Map<String, Object> reservationInfo = reservationStylistService.findReservationInfoByOrderId(approvalRequest.getOrderId());

                        if (reservationInfo != null && reservationInfo.containsKey("reservationId")) {

                            Map<String, Object> response = new HashMap<>();
                            response.put("success", true);
                            response.put("message", "이미 처리된 결제입니다.");
                            response.put("paymentKey", approvalRequest.getPaymentKey());
                            response.put("orderId", approvalRequest.getOrderId());
                            response.put("amount", approvalRequest.getAmount());
                            response.put("reservationId", reservationInfo.get("reservationId"));
                            response.put("reservationInfo", reservationInfo);

                            return ResponseEntity.ok(response);
                        }
                    } else if ("ABORTED".equals(status.getStatus())) {
                        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                                .body(Map.of(
                                        "success", false,
                                        "message", "결제가 중단되었습니다. 다시 시도해주세요.",
                                        "code", "PAYMENT_ABORTED"
                                ));
                    }

                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                            .body(Map.of(
                                    "success", false,
                                    "message", "결제가 처리 중입니다. 잠시 후 다시 시도해주세요.",
                                    "code", "PAYMENT_IN_PROGRESS"
                            ));
                } catch (Exception e) {
                    log.warn("결제 상태 확인 중 오류: {}", e.getMessage());

                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                            .body(Map.of(
                                    "success", false,
                                    "message", "결제가 처리 중입니다. 잠시 후 다시 시도해주세요.",
                                    "code", "PAYMENT_IN_PROGRESS"
                            ));
                }
            }

            try {
                PaymentResponseDto paymentResponse = paymentService.approvePayment(
                        approvalRequest.getPaymentKey(),
                        approvalRequest.getOrderId(),
                        approvalRequest.getAmount(),
                        userId
                );

                if (!"DONE".equals(paymentResponse.getStatus())) {
                    log.warn("결제 상태가 완료되지 않음: status={}", paymentResponse.getStatus());
                    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                            .body(Map.of(
                                    "success", false,
                                    "message", "결제가 아직 완료되지 않았습니다.",
                                    "paymentStatus", paymentResponse.getStatus()
                            ));
                }

                ReservationRequestDto reservationRequest = approvalRequest.getReservationData();
                if (reservationRequest != null) {
                    reservationRequest.setOrderId(approvalRequest.getOrderId());

                    if (reservationRequest.getPaymentMethod() == null) {
                        reservationRequest.setPaymentMethod("toss");
                    }

                    if (reservationRequest.getPaymentStatus() == null) {
                        reservationRequest.setPaymentStatus("COMPLETED");
                    }

                    Long reservationId = reservationStylistService.completeReservation(reservationRequest, userId);
                    log.info("예약 완료: orderId={}, reservationId={}", approvalRequest.getOrderId(), reservationId);

                    Map<String, Object> reservationInfo = reservationStylistService.findReservationInfoByOrderId(approvalRequest.getOrderId());


                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("paymentKey", approvalRequest.getPaymentKey());
                    response.put("orderId", approvalRequest.getOrderId());
                    response.put("amount", approvalRequest.getAmount());
                    response.put("reservationId", reservationId);

                    Map<String, Object> paymentInfo = new HashMap<>();
                    paymentInfo.put("method", paymentResponse.getMethod());
                    paymentInfo.put("approvedAt", paymentResponse.getApprovedAt());
                    paymentInfo.put("totalAmount", paymentResponse.getTotalAmount());
                    response.put("paymentInfo", paymentInfo);

                    if (reservationInfo != null) {
                        response.put("reservationInfo", reservationInfo);
                    }

                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "paymentKey", approvalRequest.getPaymentKey(),
                            "orderId", approvalRequest.getOrderId(),
                            "amount", approvalRequest.getAmount(),
                            "paymentInfo", Map.of(
                                    "method", paymentResponse.getMethod(),
                                    "approvedAt", paymentResponse.getApprovedAt(),
                                    "totalAmount", paymentResponse.getTotalAmount()
                            )
                    ));
                }
            } finally {
                if (lockKey != null) {
                    paymentProcessingLocks.remove(lockKey);
                }
            }

        } catch (Exception e) {
            if (lockKey != null) {
                paymentProcessingLocks.remove(lockKey);
            }

            log.error("결제 승인 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "결제 승인 중 오류가 발생했습니다.");
            errorResponse.put("error", e.getMessage());

            // 토스페이먼츠 오류 코드 확인
            if (e.getMessage() != null && e.getMessage().contains("FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING")) {
                errorResponse.put("code", "DUPLICATE_REQUEST");
                errorResponse.put("message", "중복된 결제 요청입니다. 잠시 후 다시 시도해주세요.");
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/status/{paymentKey}")
    public ResponseEntity<?> getPaymentStatus(
            @PathVariable String paymentKey,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        try {
            PaymentStatusResponseDto status = paymentService.getPaymentStatus(paymentKey);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", status.getStatus());
            response.put("paymentKey", paymentKey);

            if (status.getApprovedAt() != null) {
                response.put("approvedAt", status.getApprovedAt());
            }

            if (status.getMethod() != null) {
                response.put("method", status.getMethod());
            }

            if (status.getTotalAmount() != null) {
                response.put("totalAmount", status.getTotalAmount());
            }

            if (status.getOrderId() != null) {
                response.put("orderId", status.getOrderId());

                try {
                    Map<String, Object> reservationInfo = reservationStylistService.findReservationInfoByOrderId(status.getOrderId());
                    if (reservationInfo != null && !reservationInfo.isEmpty()) {
                        response.put("reservationInfo", reservationInfo);
                    }
                } catch (Exception ex) {
                    log.warn("예약 정보 조회 중 오류: {}", ex.getMessage());
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결제 상태 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "결제 상태 조회 중 오류가 발생했습니다.",
                            "error", e.getMessage()
                    ));
        }
    }

    @GetMapping("/reservation/by-order/{orderId}")
    public ResponseEntity<?> getReservationByOrderId(
            @PathVariable String orderId,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        try {
            Map<String, Object> reservationInfo = reservationStylistService.findReservationInfoByOrderId(orderId);

            if (reservationInfo == null || !reservationInfo.containsKey("reservationId")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "해당 주문으로 예약된 정보가 없습니다.",
                                "orderId", orderId
                        ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", orderId);
            response.putAll(reservationInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("예약 정보 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "예약 정보 조회 중 오류가 발생했습니다.",
                            "error", e.getMessage(),
                            "orderId", orderId
                    ));
        }
    }

    @PostMapping("/cancel/{paymentKey}")
    public ResponseEntity<?> cancelPayment(
            @PathVariable String paymentKey,
            @RequestBody(required = false) Map<String, String> requestBody,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        try {
            String cancelReason = requestBody != null ? requestBody.get("cancelReason") : "사용자 요청에 의한 취소";

            Map<String, Object> cancelResult = paymentService.cancelPayment(paymentKey, cancelReason);

            return ResponseEntity.ok(cancelResult);
        } catch (Exception e) {
            log.error("결제 취소 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "결제 취소 중 오류가 발생했습니다.",
                            "error", e.getMessage(),
                            "paymentKey", paymentKey
                    ));
        }
    }
}