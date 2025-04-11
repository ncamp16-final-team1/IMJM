package com.IMJM.jwt;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserResponseDto;
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

public class UserJWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public UserJWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authorization = null;

        String requestUri = request.getRequestURI();

        if (requestUri.matches("^\\/oauth2(?:\\/.*)?$")) {

            filterChain.doFilter(request, response);
            return;
        }

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("Authorization")) {
                    authorization = cookie.getValue();
                    break;
                }
            }
        }

        if (authorization == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization;

        if (jwtUtil.isExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.getUserName(token);
        String role = jwtUtil.getRole(token);

        UserResponseDto userDto = new UserResponseDto();
        userDto.setId(username);
        userDto.setUserType(role);

        CustomOAuth2UserDto customOAuth2UserDto = new CustomOAuth2UserDto(userDto);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customOAuth2UserDto, null, customOAuth2UserDto.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
