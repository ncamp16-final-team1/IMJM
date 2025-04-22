package com.IMJM.admin.dto;

import com.IMJM.common.entity.Payment;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AdminReservationDto {
    private Long id;
    private Long reservationId;
    private String userId;
    private String userName;
    private String userProfile;
    private String stylistName;
    private String serviceName;
    private int paymentPrice;
    private String reservationDate;
    private String reservationTime;

    public AdminReservationDto(Payment payment) {
        this.id = payment.getId();
        this.reservationId = payment.getReservation().getId();
        this.userId = payment.getReservation().getUser().getId();
        this.userName = payment.getReservation().getUser().getLastName() + " " + payment.getReservation().getUser().getFirstName();
        this.userProfile = payment.getReservation().getUser().getProfile();
        this.stylistName = payment.getReservation().getStylist().getName();
        this.serviceName = payment.getReservation().getReservationServiceName();
        this.paymentPrice = payment.getPrice();
        this.reservationDate = String.valueOf(payment.getReservation().getReservationDate());
        this.reservationTime = String.valueOf(payment.getReservation().getReservationTime());
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminReservationUpdateDto {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private String reservationDate;

        @JsonFormat(pattern = "HH:mm:ss")
        private String reservationTime;
    }
}
