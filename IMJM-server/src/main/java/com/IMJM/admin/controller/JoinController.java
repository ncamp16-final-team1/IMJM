package com.IMJM.admin.controller;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.service.JoinService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JoinController {

    private final JoinService joinService;

    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    @PostMapping("/join")
    public String joinProcess(SalonDto joinDTO) {
        joinService.joinProcess(joinDTO);
        return "ok";
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return ResponseEntity.ok().build();
    }
}