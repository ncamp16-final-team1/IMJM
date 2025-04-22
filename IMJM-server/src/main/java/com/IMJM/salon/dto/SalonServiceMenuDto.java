package com.IMJM.salon.dto;

import com.IMJM.common.entity.ServiceMenu;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SalonServiceMenuDto {

    private Long id;
    private String serviceType;
    private String serviceName;
    private String serviceDescription;
    private int price;

    @Builder
    public SalonServiceMenuDto(ServiceMenu serviceMenu){
        this.id= serviceMenu.getId();
        this.serviceType=serviceMenu.getServiceType();
        this.serviceName=serviceMenu.getServiceName();
        this.serviceDescription=serviceMenu.getServiceDescription();
        this.price=serviceMenu.getPrice();
    }
}
