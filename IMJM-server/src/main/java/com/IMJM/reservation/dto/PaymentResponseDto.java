package com.IMJM.reservation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentResponseDto {
    private String mId;                   // 가맹점 ID
    private String version;               // 결제 버전
    private String paymentKey;            // 결제 키
    private String orderId;               // 주문 ID
    private String orderName;             // 주문명
    private String currency;              // 통화 (KRW)
    private String method;                // 결제 수단
    private String status;                // 결제 상태
    private String requestedAt;           // 결제 요청 시간
    private String approvedAt;            // 결제 승인 시간
    private boolean useEscrow;            // 에스크로 사용 여부
    private boolean cultureExpense;       // 문화비 지출 여부
    private long totalAmount;             // 총 결제 금액
    private long balanceAmount;           // 잔액
    private String suppliedAmount;        // 공급가액
    private String vat;                   // 부가세
    private String country;               // 국가
    private Map<String, Object> card;     // 카드 결제 정보 (카드 결제시)
    private Map<String, Object> virtualAccount; // 가상계좌 정보 (가상계좌 결제시)
    private Map<String, Object> transfer; // 계좌이체 정보 (계좌이체 결제시)
    private Map<String, Object> receipt;  // 영수증 정보
    private Map<String, Object> checkout; // 체크아웃 정보
    private String type;                  // 결제 타입
}
