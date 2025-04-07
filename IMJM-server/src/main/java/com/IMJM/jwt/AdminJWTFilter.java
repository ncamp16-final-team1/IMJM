package com.IMJM.jwt;

import com.IMJM.admin.dto.CustomHairSalonDetails;
import com.IMJM.admin.entity.HairSalon;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AdminJWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public AdminJWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = null;

        String requestUri = request.getRequestURI();

        if (requestUri.matches("^\\/login(?:\\/.*)?$")) {

            filterChain.doFilter(request, response);
            return;
        }

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                // 예: Admin용 JWT는 "AdminToken" 쿠키에 저장된다고 가정
                if (cookie.getName().equals("AdminToken")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null || jwtUtil.isExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        HairSalon data = HairSalon.builder()
                .id(jwtUtil.getUserName(token))
                .password("temppassword")
                .build();

        CustomHairSalonDetails customHairSalonDetails = new CustomHairSalonDetails(data);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customHairSalonDetails, null, customHairSalonDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
