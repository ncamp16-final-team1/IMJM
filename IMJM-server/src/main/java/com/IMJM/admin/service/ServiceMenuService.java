package com.IMJM.admin.service;

import com.IMJM.admin.dto.ServiceMenuDto;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.admin.repository.ServiceMenuRepository;
import com.IMJM.common.entity.Salon;
import com.IMJM.common.entity.ServiceMenu;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceMenuService {

    private final ServiceMenuRepository serviceMenuRepository;
    private final SalonRepository salonRepository;

    public List<ServiceMenuDto> getServiceMenus(String salonId) {
        List<ServiceMenu> serviceMenus = serviceMenuRepository.findBySalonId(salonId);

        return serviceMenus.stream()
                .map(serviceMenu -> ServiceMenuDto.builder()
                        .id(serviceMenu.getId())
                        .serviceType(serviceMenu.getServiceType())
                        .serviceName(serviceMenu.getServiceName())
                        .serviceDescription(serviceMenu.getServiceDescription())
                        .price(serviceMenu.getPrice())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveMenus(String salonId, List<ServiceMenuDto> menuDtos) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 미용실 ID"));

        List<ServiceMenu> existingMenus = serviceMenuRepository.findAllBySalonId(salonId);

        Map<Long, ServiceMenu> menuMap = existingMenus.stream()
                .collect(Collectors.toMap(ServiceMenu::getId, m -> m));

        Set<Long> updatedIds = new HashSet<>();

        for (ServiceMenuDto dto : menuDtos) {
            if (dto.getId() != null && menuMap.containsKey(dto.getId())) {
                // 수정
                ServiceMenu menu = menuMap.get(dto.getId());
                menu.serviceMenuUpdate(dto.getServiceType(), dto.getServiceName(), dto.getServiceDescription(), dto.getPrice());
                updatedIds.add(menu.getId());
            } else {
                // 새로 추가
                ServiceMenu newMenu = ServiceMenu.builder()
                        .serviceType(dto.getServiceType())
                        .serviceName(dto.getServiceName())
                        .serviceDescription(dto.getServiceDescription())
                        .price(dto.getPrice())
                        .salon(salon)
                        .build();
                serviceMenuRepository.save(newMenu);
            }
        }

        for (ServiceMenu menu : existingMenus) {
            if (!updatedIds.contains(menu.getId())) {
                serviceMenuRepository.delete(menu);
            }
        }
    }
}
