package com.IMJM.jwt;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@Component
public class UserSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.client.domain}")
    private String clientDomain;

    private final JWTUtil jwtUtil;

    public UserSuccessHandler(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        System.out.println("onAuthenticationSuccess");
        CustomOAuth2UserDto customUserDetails = (CustomOAuth2UserDto) authentication.getPrincipal();

        String userId = customUserDetails.getId();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        String token = jwtUtil.createJwt(userId, role, 60 * 60 * 24 * 1000L);

        ResponseCookie cookie = ResponseCookie.from("Authorization", token)
                .httpOnly(true) // XSS 방어
                .secure(true) // HTTPS 환경
                .sameSite("None") // 크로스 도메인 대응
                .path("/")
                .domain("imjm-hair.com")
                .maxAge(60 * 60 * 24)
                .build();

        response.setHeader("Set-Cookie", cookie.toString());

        //response.addCookie(createCookie("Authorization", token));

        if (!customUserDetails.isTermsAgreed()) {
            response.sendRedirect(clientDomain + "/user/language");
        } else {
            response.sendRedirect(clientDomain);
        }
    }

    private Cookie createCookie(String key, String token) {

        Cookie cookie = new Cookie(key, token);
        cookie.setMaxAge(60*60*24);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);  // https 만 허용 할 경우
        cookie.setPath("/");

        return cookie;
    }

}
