package com.IMJM.admin.controller;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.ServiceMenuDto;
import com.IMJM.admin.service.ServiceMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/salon-designs")
public class ServiceMenuController {

    private final ServiceMenuService serviceMenuService;

    @GetMapping("/designs")
    public ResponseEntity<List<ServiceMenuDto>> getServiceMenus(@AuthenticationPrincipal CustomSalonDetails salonDto) {
        String salonId = salonDto.getSalon().getId();
        List<ServiceMenuDto> serviceMenus = serviceMenuService.getServiceMenus(salonId);

        return ResponseEntity.ok(serviceMenus);
    }

    @PostMapping("/menus")
    public ResponseEntity<Void> saveDesigns(@AuthenticationPrincipal CustomSalonDetails salonDto,
                                            @RequestBody List<ServiceMenuDto> menuDtos) {
        serviceMenuService.saveMenus(salonDto.getSalon().getId(), menuDtos);
        return ResponseEntity.ok().build();
    }
}
