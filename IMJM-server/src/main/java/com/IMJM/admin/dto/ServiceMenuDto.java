package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceMenuDto {
    private Long id;
    private String serviceType;
    private String serviceName;
    private String serviceDescription;
    private int price;
}
