package com.IMJM.jwt;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.common.entity.Salon;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class AdminJWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public AdminJWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = null;

        String requestUri = request.getRequestURI();

        if (!requestUri.startsWith("/admin") && !requestUri.startsWith("/api/admin")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (requestUri.matches("^\\/login(?:\\/.*)?$")) {

            filterChain.doFilter(request, response);
            return;
        }

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
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

        Salon data = Salon.builder()
                .id(jwtUtil.getUserName(token))
                .password("temppassword")
                .build();

        CustomSalonDetails customSalonDetails = new CustomSalonDetails(data);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customSalonDetails, null, customSalonDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
