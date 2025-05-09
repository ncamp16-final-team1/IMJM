package com.IMJM.reservation.dto;

import com.IMJM.reservation.dto.ReservationRequestDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentApprovalRequestDto {
    private String paymentKey;
    private String orderId;
    private int amount;
    private ReservationRequestDto reservationData;
}
