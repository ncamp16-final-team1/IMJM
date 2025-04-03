package com.IMJM.admin.controller;

import com.IMJM.admin.dto.HairSalonDto;
import com.IMJM.admin.service.JoinService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@ResponseBody
public class JoinController {

    private final JoinService joinService;

    public JoinController(JoinService joinService) {

        this.joinService = joinService;
    }

    @PostMapping("/join")
    public String joinProcess(HairSalonDto joinDTO) {

        System.out.println(joinDTO.getId());
        joinService.joinProcess(joinDTO);

        return "ok";
    }
}