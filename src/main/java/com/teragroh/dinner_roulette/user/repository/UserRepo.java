package com.teragroh.dinner_roulette.user.repository;

import com.teragroh.dinner_roulette.user.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<Users,Long> {

    Users findByUsername(String username);

}
