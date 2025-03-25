package com.IMJM.common.test.controller;

import com.IMJM.common.test.entity.UserEntity;
import com.IMJM.common.test.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/db")
    public String testDbConnection() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "데이터베이스 연결 성공!";
        } catch (Exception e) {
            return "데이터베이스 연결 실패!" + e.getMessage();
        }
    }

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
}
