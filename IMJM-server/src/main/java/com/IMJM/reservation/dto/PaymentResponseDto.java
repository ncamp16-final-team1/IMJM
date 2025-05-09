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
    private String mId;
    private String version;
    private String paymentKey;
    private String orderId;
    private String orderName;
    private String currency;
    private String method;
    private String status;
    private String requestedAt;
    private String approvedAt;
    private boolean useEscrow;
    private boolean cultureExpense;
    private long totalAmount;
    private long balanceAmount;
    private String suppliedAmount;
    private String vat;
    private String country;
    private Map<String, Object> card;
    private Map<String, Object> virtualAccount;
    private Map<String, Object> transfer;
    private Map<String, Object> receipt;
    private Map<String, Object> checkout;
    private String type;
}
