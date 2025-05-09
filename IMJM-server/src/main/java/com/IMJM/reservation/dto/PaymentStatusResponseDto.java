package com.IMJM.reservation.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.Map;

/**
 * 토스페이먼츠 결제 상태 조회 API 응답을 위한 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentStatusResponseDto {

    /**
     * 결제의 키 값
     */
    private String paymentKey;

    /**
     * 주문 ID
     */
    private String orderId;

    /**
     * 결제 상태
     * - READY: 결제 준비
     * - IN_PROGRESS: 결제 진행중
     * - WAITING_FOR_DEPOSIT: 가상계좌 입금 대기중
     * - DONE: 결제 완료
     * - CANCELED: 결제 취소됨
     * - PARTIAL_CANCELED: 결제 부분 취소됨
     * - ABORTED: 결제 중단됨
     * - EXPIRED: 결제 만료됨
     */
    private String status;

    /**
     * 결제 금액
     */
    private Integer totalAmount;

    /**
     * 결제 방식
     * - 카드: card
     * - 가상계좌: virtualAccount
     * - 계좌이체: transfer
     * - 휴대폰: phone
     * - 문화상품권: cultureLand
     * - 도서문화상품권: bookCulture
     * - 게임문화상품권: gameCulture
     * - 포인트: point
     * - 상품권: giftCertificate
     * - 기프트카드: giftCard
     */
    private String method;

    /**
     * 결제가 승인된 시각
     */
    // LocalDateTime에서 OffsetDateTime으로 변경
    private OffsetDateTime approvedAt;

    /**
     * 취소된 금액
     */
    private Integer canceledAmount;

    /**
     * 마지막 취소 시각
     */
    // LocalDateTime에서 OffsetDateTime으로 변경
    private OffsetDateTime canceledAt;

    /**
     * 결제 요청 시각
     */
    // LocalDateTime에서 OffsetDateTime으로 변경
    private OffsetDateTime requestedAt;

    /**
     * 카드 정보 (카드 결제시)
     */
    @JsonProperty("card")
    private CardInfo cardInfo;

    /**
     * 가상계좌 정보 (가상계좌 결제시)
     */
    @JsonProperty("virtualAccount")
    private VirtualAccountInfo virtualAccountInfo;

    /**
     * 결제 실패 정보 (결제 실패시)
     */
    @JsonProperty("failure")
    private FailureInfo failureInfo;

    /**
     * 취소 이력
     */
    private CancelHistoryInfo[] cancels;

    /**
     * 영수증 URL
     */
    private String receipt;

    /**
     * 결제창 URL
     */
    private String checkoutUrl;

    /**
     * 상점 이름
     */
    private String shopName;

    /**
     * 주문명
     */
    private String orderName;

    /**
     * 카드 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CardInfo {
        private String company;           // 카드사 이름
        private String number;            // 마스킹된 카드 번호
        private String installmentPlanMonths; // 할부 개월 수
        private Boolean isInterestFree;   // 무이자 할부 여부
        private String approveNo;         // 승인 번호
        private String cardType;          // 카드 종류 (신용, 체크, 기프트)
        private String ownerType;         // 소유자 타입 (개인, 법인)
        private String acquireStatus;     // 매입 상태
        private String receiptUrl;        // 영수증 URL
    }

    /**
     * 가상계좌 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VirtualAccountInfo {
        private String accountNumber;     // 가상계좌 번호
        private String bank;              // 은행명
        private String customerName;      // 예금주명
        private String dueDate;           // 입금기한
        private Boolean expired;          // 만료 여부
        private String settlementStatus;  // 정산 상태
        private String refundStatus;      // 환불 상태
    }

    /**
     * 결제 실패 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FailureInfo {
        private String code;              // 오류 코드
        private String message;           // 오류 메시지
    }

    /**
     * 취소 이력 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CancelHistoryInfo {
        private String cancelAmount;      // 취소 금액
        private String cancelReason;      // 취소 사유
        private String canceledAt;        // 취소 시각
        private String taxFreeAmount;     // 취소된 비과세 금액
        private Map<String, Object> refundableAmount; // 환불 가능 금액 정보
    }

    /**
     * 토스페이먼츠 응답에서 상태가 DONE인지 확인하는 편의 메서드
     */
    public boolean isSuccessful() {
        return "DONE".equals(status);
    }

    /**
     * 토스페이먼츠 응답에서 상태가 ABORTED인지 확인하는 편의 메서드
     */
    public boolean isAborted() {
        return "ABORTED".equals(status);
    }

    /**
     * 토스페이먼츠 응답에서 상태가 CANCELED인지 확인하는 편의 메서드
     */
    public boolean isCanceled() {
        return "CANCELED".equals(status);
    }

    /**
     * OffsetDateTime을 LocalDateTime으로 변환하는 유틸리티 메서드
     * 이전 코드와의 호환성을 위해 필요할 경우 사용
     */
    public LocalDateTime getRequestedAtAsLocalDateTime() {
        return requestedAt != null ? requestedAt.toLocalDateTime() : null;
    }

    /**
     * OffsetDateTime을 LocalDateTime으로 변환하는 유틸리티 메서드
     * 이전 코드와의 호환성을 위해 필요할 경우 사용
     */
    public LocalDateTime getApprovedAtAsLocalDateTime() {
        return approvedAt != null ? approvedAt.toLocalDateTime() : null;
    }

    /**
     * OffsetDateTime을 LocalDateTime으로 변환하는 유틸리티 메서드
     * 이전 코드와의 호환성을 위해 필요할 경우 사용
     */
    public LocalDateTime getCanceledAtAsLocalDateTime() {
        return canceledAt != null ? canceledAt.toLocalDateTime() : null;
    }
}