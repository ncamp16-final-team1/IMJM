package com.IMJM.config;

import com.IMJM.jwt.AdminJWTFilter;
import com.IMJM.jwt.JWTUtil;
import com.IMJM.jwt.AdminLoginFilter;
import com.IMJM.jwt.UserJWTFilter;
import com.IMJM.jwt.UserSuccessHandler;
import com.IMJM.user.repository.UserRepository;
import com.IMJM.user.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.client.domain}")
    private String clientDomain;

    @Value("${app.admin.domain}")
    private String adminDomain;

    private final AuthenticationConfiguration authenticationConfiguration;
    private final UserSuccessHandler userSuccessHandler;
    private final JWTUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;

    private final UserRepository userRepository;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration,
                          UserSuccessHandler userSuccessHandler,
                          JWTUtil jwtUtil,
                          CustomOAuth2UserService customOAuth2UserService,
                          UserRepository userRepository) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.userSuccessHandler = userSuccessHandler;
        this.jwtUtil = jwtUtil;
        this.customOAuth2UserService = customOAuth2UserService;
        this.userRepository = userRepository;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors
                        .configurationSource(request -> {
                            CorsConfiguration configuration = new CorsConfiguration();
                            configuration.setAllowedOrigins(List.of(clientDomain, adminDomain));
                            configuration.setAllowedMethods(List.of("*"));
                            configuration.setAllowedHeaders(List.of("*"));
                            configuration.setExposedHeaders(List.of("Set-Cookie", "Authorization"));
                            configuration.setAllowCredentials(true);
                            configuration.setMaxAge(3600L);
                            return configuration;
                        })
                )
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .httpBasic(basic -> basic.disable())

                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint.userService(customOAuth2UserService))
                        .successHandler(userSuccessHandler)
                )

                // 경로별 인가 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/admin/login"
                                ,"/api/admin/check-id"
                                ,"/api/admin/join"
                                ,"/api/user/location"
                                ,"/api/salon/**"
                                ,"/api/archive/**"
                                ,"/api/review/**"
                                ,"/api/review-reply/**"
                        ).permitAll()
                        .requestMatchers("/api/admin/check-login").authenticated()
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터 추가
                .addFilterBefore(new AdminJWTFilter(jwtUtil), AdminLoginFilter.class)
                .addFilterBefore(new UserJWTFilter(jwtUtil, userRepository), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new UserJWTFilter(jwtUtil, userRepository), OAuth2LoginAuthenticationFilter.class)
                .addFilterAt(new AdminLoginFilter(authenticationManager(authenticationConfiguration), jwtUtil), UsernamePasswordAuthenticationFilter.class)

                // 세션 관리 설정
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 예외 처리 설정 (Spring Security 6.1 이상에서의 변경된 방식)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"UNAUTHORIZED\"}");
                        })
                );

        return http.build();
    }
}