package com.IMJM.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/user")
    public String mainAPI() {

        return "user route";
    }

    @GetMapping("/my")
    public String myAPI() {
        return "my route";
    }
}
