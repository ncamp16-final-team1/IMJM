package com.IMJM.reservation.service;

import com.IMJM.reservation.dto.PaymentApprovalRequestDto;
import com.IMJM.reservation.dto.PaymentResponseDto;
import com.IMJM.reservation.dto.PaymentStatusResponseDto;
import com.IMJM.reservation.dto.ReservationRequestDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ReservationStylistService reservationStylistService;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    /**
     * Base64로 인코딩된 JSON 문자열을 객체로 변환
     */
    public PaymentApprovalRequestDto parsePaymentRequest(String jsonString) {
        try {
            return objectMapper.readValue(jsonString, PaymentApprovalRequestDto.class);
        } catch (Exception e) {
            log.error("JSON 파싱 오류: {}", e.getMessage(), e);
            throw new RuntimeException("결제 요청 데이터 파싱에 실패했습니다.");
        }
    }

    /**
     * 토스페이먼츠 API를 호출하여 결제 승인
     */
    @Transactional
    public PaymentResponseDto approvePayment(String paymentKey, String orderId, int amount, String userId) {
        // 토스페이먼츠 API URL
        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey;

        // Basic Authentication 헤더 생성
        String encodedAuth = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Authorization", "Basic " + encodedAuth);

        // 요청 본문 생성
        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("orderId", orderId);
        requestBodyMap.put("amount", amount);

        try {
            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            // HTTP 요청 설정
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK) {
                // 응답 JSON을 객체로 변환
                PaymentResponseDto paymentResponse = objectMapper.readValue(
                        response.getBody(), PaymentResponseDto.class);

                log.info("결제 승인 성공: paymentKey={}, orderId={}, status={}",
                        paymentKey, orderId, paymentResponse.getStatus());

                return paymentResponse;
            } else {
                log.error("토스페이먼츠 API 호출 실패: {}", response.getBody());
                throw new RuntimeException("결제 승인 실패: " + response.getBody());
            }
        } catch (HttpStatusCodeException e) {
            // HTTP 에러 응답을 처리 (4xx, 5xx 오류)
            String responseBody = e.getResponseBodyAsString();
            log.error("토스페이먼츠 API 호출 오류: 상태 코드 = {}, 응답 = {}", e.getStatusCode(), responseBody);

            try {
                // 오류 응답 JSON 파싱
                JsonNode errorNode = objectMapper.readTree(responseBody);
                String errorCode = errorNode.path("code").asText();
                String errorMessage = errorNode.path("message").asText();

                // FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING 오류 처리
                if ("FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING".equals(errorCode)) {
                    // 이미 처리 중인 요청이므로, 결제 상태 조회 API 호출
                    log.info("이미 처리 중인 결제 요청입니다. 결제 상태를 조회합니다. paymentKey={}", paymentKey);

                    // 잠시 대기 후 결제 상태 조회
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }

                    PaymentStatusResponseDto status = getPaymentStatus(paymentKey);

                    // PaymentResponseDto로 변환하여 반환
                    if ("DONE".equals(status.getStatus())) {
                        PaymentResponseDto result = convertToPaymentResponseDto(status);
                        log.info("기존 결제가 완료되었습니다: paymentKey={}, orderId={}",
                                paymentKey, status.getOrderId());
                        return result;
                    } else if ("ABORTED".equals(status.getStatus())) {
                        log.warn("결제가 중단되었습니다. 다시 결제를 시도해주세요.");
                        throw new PaymentStatusException("결제가 중단되었습니다. 다시 결제를 시도해주세요.", "ABORTED");
                    } else {
                        log.warn("예상치 못한 결제 상태: {}", status.getStatus());
                        throw new PaymentStatusException("결제 상태가 유효하지 않습니다.", status.getStatus());
                    }
                }

                throw new RuntimeException("결제 승인 실패: " + errorCode + " - " + errorMessage);
            } catch (PaymentStatusException pse) {
                throw pse;
            } catch (Exception ex) {
                throw new RuntimeException("결제 승인 실패: " + responseBody, ex);
            }
        } catch (RestClientException e) {
            log.error("토스페이먼츠 API 통신 오류: {}", e.getMessage());
            throw new RuntimeException("토스페이먼츠 API 통신 오류", e);
        } catch (Exception e) {
            log.error("결제 승인 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("결제 승인 중 오류 발생", e);
        }
    }

    /**
     * 결제 상태 조회 API 호출
     * @param paymentKey 토스페이먼츠 결제 키
     * @return 결제 상태 정보
     */
    public PaymentStatusResponseDto getPaymentStatus(String paymentKey) {
        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey;

        // Basic Authentication 헤더 생성
        String encodedAuth = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Authorization", "Basic " + encodedAuth);

        // HTTP 요청 설정
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // API 호출 (GET 요청)
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK) {
                // 응답 JSON을 객체로 변환
                PaymentStatusResponseDto paymentStatus = objectMapper.readValue(
                        response.getBody(), PaymentStatusResponseDto.class
                );

                log.info("결제 상태 조회 성공: paymentKey={}, status={}", paymentKey, paymentStatus.getStatus());
                return paymentStatus;
            } else {
                log.error("결제 상태 조회 실패: {}", response.getBody());
                throw new RuntimeException("결제 상태 조회 실패: " + response.getBody());
            }
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("결제 상태 조회 API 오류: 상태 코드 = {}, 응답 = {}", e.getStatusCode(), responseBody);
            throw new RuntimeException("결제 상태 조회 실패: " + responseBody);
        } catch (Exception e) {
            log.error("결제 상태 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("결제 상태 조회 중 오류 발생", e);
        }
    }

    /**
     * PaymentStatusResponseDto를 PaymentResponseDto로 변환
     * @param statusDto 상태 응답 DTO
     * @return 결제 응답 DTO
     */
    private PaymentResponseDto convertToPaymentResponseDto(PaymentStatusResponseDto statusDto) {
        PaymentResponseDto responseDto = new PaymentResponseDto();
        responseDto.setPaymentKey(statusDto.getPaymentKey());
        responseDto.setOrderId(statusDto.getOrderId());
        responseDto.setStatus(statusDto.getStatus());
        responseDto.setTotalAmount(statusDto.getTotalAmount());
        responseDto.setMethod(statusDto.getMethod());

        // LocalDateTime을 String으로 변환
        if (statusDto.getApprovedAt() != null) {
            // ISO-8601 형식으로 변환 (2023-01-01T12:30:45+09:00)
            responseDto.setApprovedAt(statusDto.getApprovedAt().toString());

            // 또는 원하는 형식으로 포맷팅
            // DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            // responseDto.setApprovedAt(statusDto.getApprovedAt().format(formatter));
        }

        // 다른 필드도 필요에 따라 설정
        if (statusDto.getRequestedAt() != null) {
            responseDto.setRequestedAt(statusDto.getRequestedAt().toString());
        }


        responseDto.setOrderName(statusDto.getOrderName());

        // 카드 정보나 다른 결제 수단 정보도 필요한 경우 설정
        if (statusDto.getCardInfo() != null) {
            responseDto.setCard(convertCardInfo(statusDto.getCardInfo()));
        }

        return responseDto;
    }
    // 카드 정보를 Map으로 변환
    private Map<String, Object> convertCardInfo(PaymentStatusResponseDto.CardInfo cardInfo) {
        Map<String, Object> cardMap = new HashMap<>();
        cardMap.put("company", cardInfo.getCompany());
        cardMap.put("number", cardInfo.getNumber());
        cardMap.put("installmentPlanMonths", cardInfo.getInstallmentPlanMonths());
        cardMap.put("isInterestFree", cardInfo.getIsInterestFree());
        cardMap.put("approveNo", cardInfo.getApproveNo());
        cardMap.put("cardType", cardInfo.getCardType());
        cardMap.put("ownerType", cardInfo.getOwnerType());
        cardMap.put("acquireStatus", cardInfo.getAcquireStatus());
        cardMap.put("receiptUrl", cardInfo.getReceiptUrl());
        return cardMap;
    }

    /**
     * 결제 취소 API 호출
     * @param paymentKey 토스페이먼츠 결제 키
     * @param cancelReason 취소 사유
     * @return 취소 결과
     */
    public Map<String, Object> cancelPayment(String paymentKey, String cancelReason) {
        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        // Basic Authentication 헤더 생성
        String encodedAuth = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Authorization", "Basic " + encodedAuth);

        // 요청 본문 생성
        Map<String, String> requestBodyMap = new HashMap<>();
        requestBodyMap.put("cancelReason", cancelReason != null ? cancelReason : "사용자 요청에 의한 취소");

        try {
            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            // HTTP 요청 설정
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            // 응답 처리
            if (response.getStatusCode() == HttpStatus.OK) {
                // 응답 JSON을 Map으로 변환
                Map<String, Object> cancelResult = objectMapper.readValue(
                        response.getBody(), Map.class);

                log.info("결제 취소 성공: paymentKey={}", paymentKey);
                cancelResult.put("success", true);
                return cancelResult;
            } else {
                log.error("결제 취소 API 호출 실패: {}", response.getBody());
                throw new RuntimeException("결제 취소 실패: " + response.getBody());
            }
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("결제 취소 API 오류: 상태 코드 = {}, 응답 = {}", e.getStatusCode(), responseBody);
            throw new RuntimeException("결제 취소 실패: " + responseBody);
        } catch (Exception e) {
            log.error("결제 취소 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("결제 취소 중 오류 발생", e);
        }
    }

    /**
     * 예약 정보의 결제 상태 업데이트 및 예약 완료 처리
     */
    @Transactional
    public Long updateReservationPaymentStatus(
            ReservationRequestDto reservationRequestDto,
            PaymentResponseDto paymentResponseDto,
            String userId
    ) {
        try {
            log.debug("예약 결제 상태 업데이트 시작: {}", reservationRequestDto);

            if (reservationRequestDto == null) {
                throw new IllegalArgumentException("예약 정보가 null입니다.");
            }

            // 결제 성공 시 orderId 설정 (transactionId로 사용)
            if (paymentResponseDto != null && paymentResponseDto.getOrderId() != null) {
                reservationRequestDto.setOrderId(paymentResponseDto.getOrderId());
                log.debug("orderId를 transactionId로 설정: {}", paymentResponseDto.getOrderId());
            }

            // 예약 정보에 isPaid = true로 설정
            if (reservationRequestDto.getPaymentRequest() != null &&
                    reservationRequestDto.getPaymentRequest().getReservation() != null) {

                reservationRequestDto.getPaymentRequest().getReservation().setPaid(true);
                log.debug("결제 상태를 완료로 설정: isPaid=true");
            } else {
                log.warn("예약 정보 업데이트 실패: 필요한 객체가 null입니다.");
                throw new IllegalArgumentException("예약 정보의 구조가 올바르지 않습니다.");
            }

            // completeReservation 호출하여 예약 처리
            Long reservationId = reservationStylistService.completeReservation(reservationRequestDto, userId);
            log.info("예약 완료 처리 성공: reservationId={}, orderId={}",
                    reservationId, reservationRequestDto.getOrderId());

            return reservationId;
        } catch (Exception e) {
            log.error("예약 상태 업데이트 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("예약 상태 업데이트 실패", e);
        }
    }

    /**
     * 결제 상태 예외 클래스
     */
    public static class PaymentStatusException extends RuntimeException {
        private final String status;

        public PaymentStatusException(String message, String status) {
            super(message);
            this.status = status;
        }

        public String getStatus() {
            return status;
        }
    }
}