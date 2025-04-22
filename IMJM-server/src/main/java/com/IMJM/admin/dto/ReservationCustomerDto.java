package com.IMJM.admin.dto;

import com.IMJM.common.entity.Reservation;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationCustomerDto {
    private String userId;
    private String userName;
    private String serviceName;
    private LocalDate reservationDate;
    private int visitCount;
    private String requirements;

}
