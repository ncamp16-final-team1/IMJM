package com.IMJM.user.repository;

import com.IMJM.common.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users, String> {

}
