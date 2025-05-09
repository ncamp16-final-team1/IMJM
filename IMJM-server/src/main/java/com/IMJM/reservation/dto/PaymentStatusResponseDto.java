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


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentStatusResponseDto {

    private String paymentKey;
    private String orderId;
    private String status;
    private Integer totalAmount;
    private String method;
    private OffsetDateTime approvedAt;
    private Integer canceledAmount;
    private OffsetDateTime canceledAt;
    private OffsetDateTime requestedAt;

    @JsonProperty("card")
    private CardInfo cardInfo;

    @JsonProperty("virtualAccount")
    private VirtualAccountInfo virtualAccountInfo;

    @JsonProperty("failure")
    private FailureInfo failureInfo;
    private CancelHistoryInfo[] cancels;
    private String receipt;
    private String checkoutUrl;
    private String shopName;
    private String orderName;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CardInfo {
        private String company;
        private String number;
        private String installmentPlanMonths;
        private Boolean isInterestFree;
        private String approveNo;
        private String cardType;
        private String ownerType;
        private String acquireStatus;
        private String receiptUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VirtualAccountInfo {
        private String accountNumber;
        private String bank;
        private String customerName;
        private String dueDate;
        private Boolean expired;
        private String settlementStatus;
        private String refundStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FailureInfo {
        private String code;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CancelHistoryInfo {
        private String cancelAmount;
        private String cancelReason;
        private String canceledAt;
        private String taxFreeAmount;
        private Map<String, Object> refundableAmount;
    }

    public boolean isSuccessful() {
        return "DONE".equals(status);
    }

    public boolean isAborted() {
        return "ABORTED".equals(status);
    }

    public boolean isCanceled() {
        return "CANCELED".equals(status);
    }

    public LocalDateTime getRequestedAtAsLocalDateTime() {
        return requestedAt != null ? requestedAt.toLocalDateTime() : null;
    }

    public LocalDateTime getApprovedAtAsLocalDateTime() {
        return approvedAt != null ? approvedAt.toLocalDateTime() : null;
    }

    public LocalDateTime getCanceledAtAsLocalDateTime() {
        return canceledAt != null ? canceledAt.toLocalDateTime() : null;
    }
}