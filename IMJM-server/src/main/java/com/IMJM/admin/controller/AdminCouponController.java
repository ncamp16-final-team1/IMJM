package com.IMJM.admin.controller;

import com.IMJM.admin.dto.CouponDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.service.AdminCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupon")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    @GetMapping("/list")
    public ResponseEntity<List<CouponDto>> couponList(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        String salonId = salonDetails.getSalon().getId();
        List<CouponDto> couponDtos = adminCouponService.couponList(salonId);

        return ResponseEntity.ok(couponDtos);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCoupon(@AuthenticationPrincipal CustomSalonDetails salonDetails,
                                          @RequestBody CouponDto couponDto) {
        String salonId = salonDetails.getSalon().getId();
        adminCouponService.createCoupon(salonId, couponDto);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id){

        adminCouponService.deleteCoupon(id);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id,
                                          @RequestBody CouponDto couponDto){

        adminCouponService.updateCoupon(id, couponDto);

        return ResponseEntity.ok().build();
    }
}
