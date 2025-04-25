package com.IMJM.jwt;

import com.IMJM.common.entity.Users;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserResponseDto;
import com.IMJM.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Slf4j
public class UserJWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    public UserJWTFilter(JWTUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

//        String authorization = null;

        String requestUri = request.getRequestURI();

        if (requestUri.startsWith("/admin") || requestUri.startsWith("/api/admin")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (requestUri.matches("^\\/oauth2(?:\\/.*)?$")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = jwtUtil.resolveUserToken(request);

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

//        String token = authorization;

        if (jwtUtil.isExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.getUserName(token);
        String role = jwtUtil.getRole(token);

//        UserResponseDto userDto = new UserResponseDto();
//        userDto.setId(username);
//        userDto.setUserType(role);

        Optional<Users> user = userRepository.findById(username);
        if (!user.isPresent()) {
            log.info("존재하지 않는 사용자입니다.");
        }

        CustomOAuth2UserDto customOAuth2UserDto = new CustomOAuth2UserDto(user.get());

        Authentication authToken = new UsernamePasswordAuthenticationToken(customOAuth2UserDto, null, customOAuth2UserDto.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
