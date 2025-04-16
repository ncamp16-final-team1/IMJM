package com.IMJM.reservation.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationServiceMenuDto {

    private Long id;
    private String serviceType;
    private String serviceName;
    private String serviceDescription;
    private int price;
    private String salonId;

    public ReservationServiceMenuDto(Long id, String serviceType,
                                     String serviceName, String serviceDescription, int price, String salonId) {
        this.id = id;
        this.serviceType = serviceType;
        this.serviceName = serviceName;
        this.serviceDescription = serviceDescription;
        this.price = price;
        this.salonId = salonId;
    }
}
