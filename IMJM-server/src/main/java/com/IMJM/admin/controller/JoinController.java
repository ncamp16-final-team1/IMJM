package com.IMJM.admin.controller;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.service.JoinService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JoinController {

    private final JoinService joinService;

    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    @PostMapping(value = "/api/admin/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> joinProcess(@RequestPart SalonDto joinDTO,
                              @RequestPart List<MultipartFile> photos) {
        joinService.joinProcess(joinDTO, photos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return ResponseEntity.ok().build();
    }
}