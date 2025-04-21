package com.IMJM.admin.dto;

import com.IMJM.common.entity.Reservation;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationUserDto {
    private String userId;
    private String userName;
    private String serviceName;
    private LocalDate reservationDate;
    private int visitCount;
    private String requirements;

    public ReservationUserDto(Reservation reservation, int visitCount) {
        this.userId = reservation.getUser().getId();
        this.userName = reservation.getUser().getFirstName()
                + " " + reservation.getUser().getLastName();
        this.serviceName = "[" + reservation.getReservationServiceType()
                + "] " + reservation.getReservationServiceName();
        this.reservationDate = reservation.getReservationDate();
        this.visitCount = visitCount;
        this.requirements = reservation.getRequirements();
    }
}
