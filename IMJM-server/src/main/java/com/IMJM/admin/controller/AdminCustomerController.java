package com.IMJM.admin.controller;

import com.IMJM.admin.dto.BlacklistDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.ReservationCustomerDto;
import com.IMJM.admin.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/customer")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping("")
    public ResponseEntity<List<ReservationCustomerDto>> allCustomers(
            @AuthenticationPrincipal CustomSalonDetails salonDetails) {

        List<ReservationCustomerDto> reservationCustomerDtos =
                adminCustomerService.allCustomers(salonDetails.getSalonId());

        return ResponseEntity.ok(reservationCustomerDtos);
    }

    @PostMapping("/black/{userId}")
    public ResponseEntity<?> blackCustomer(@PathVariable String userId,
                                           @AuthenticationPrincipal CustomSalonDetails salonDetails,
                                           @RequestBody BlacklistDto blacklistDto) {
        adminCustomerService.blackCustomer(userId, salonDetails.getSalonId(), blacklistDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/black/{userId}")
    public ResponseEntity<?> deleteBlackCustomer(@PathVariable String userId,
                                                 @AuthenticationPrincipal CustomSalonDetails salonDetails) {
        adminCustomerService.deleteBlackCustomer(userId, salonDetails.getSalonId());
        return ResponseEntity.ok().build();
    }
}
