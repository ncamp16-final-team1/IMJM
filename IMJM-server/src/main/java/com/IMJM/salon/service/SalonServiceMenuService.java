package com.IMJM.salon.service;

import com.IMJM.common.entity.ServiceMenu;
import com.IMJM.salon.dto.SalonServiceMenuDto;
import com.IMJM.salon.repository.SalonServiceMenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalonServiceMenuService {

    private final SalonServiceMenuRepository salonServiceMenuRepository;

    public List<SalonServiceMenuDto> getServiceMenusBySalonId(String salonId) {
        List<ServiceMenu> serviceMenus = salonServiceMenuRepository.findBySalonId(salonId);
        return serviceMenus.stream()
                .map(SalonServiceMenuDto::new)
                .collect(Collectors.toList());
    }

    public SalonServiceMenuDto getServiceMenuById(Long id) {
        ServiceMenu serviceMenu = salonServiceMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Menu not found with id: " + id));
        return new SalonServiceMenuDto(serviceMenu);
    }

    public List<SalonServiceMenuDto> getServiceMenusByType(String salonId, String serviceType) {
        List<ServiceMenu> serviceMenus = salonServiceMenuRepository.findBySalonIdAndServiceType(salonId, serviceType);
        return serviceMenus.stream()
                .map(SalonServiceMenuDto::new)
                .collect(Collectors.toList());
    }
}