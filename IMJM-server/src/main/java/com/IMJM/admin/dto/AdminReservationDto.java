package com.IMJM.admin.dto;

import com.IMJM.common.entity.Payment;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AdminReservationDto {
    private Long reservationId;
    private String userId;
    private String userNickname;
    private String stylishName;
    private String serviceName;
    private int paymentPrice;
    private LocalDate reservationDate;
    private LocalTime reservationTime;

    public AdminReservationDto(Payment payment) {
        this.reservationId=payment.getReservation().getId();
        this.userId=payment.getReservation().getUser().getId();
        this.userNickname=payment.getReservation().getUser().getNickname();
        this.stylishName=payment.getReservation().getStylist().getName();
        this.paymentPrice=payment.getPrice();
        this.reservationDate=payment.getReservation().getReservationDate();
        this.reservationTime=payment.getReservation().getReservationTime();
    }
}
