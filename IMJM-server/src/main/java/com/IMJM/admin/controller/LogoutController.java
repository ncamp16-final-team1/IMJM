package com.IMJM.admin.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LogoutController {

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("AdminToken", null);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        response.addCookie(cookie);
        System.out.println("logout success");
    }
}