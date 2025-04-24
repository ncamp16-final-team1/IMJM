package com.IMJM.user.repository;

import com.IMJM.common.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, String> {
    Optional<Users> findById(String id);


    @Modifying
    @Query("UPDATE Users u SET u.point = :newPoints WHERE u.id = :userId")
    void updatePoints(@Param("userId") String userId, @Param("newPoints") int newPoints);
}
