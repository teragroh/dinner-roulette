package com.teragroh.dinner_roulette.config.security;

import com.teragroh.dinner_roulette.common.model.UserPrincipal;
import com.teragroh.dinner_roulette.user.model.Users;
import com.teragroh.dinner_roulette.user.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(MyUserDetailsService.class);

    
    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println(username);
        Users user = userRepo.findByUsername(username.toLowerCase());
        System.out.println(user.toString());
        if(user == null){
            log.warn("User not found for username: {}", username);
            throw new UsernameNotFoundException("User not found");
        }


        System.out.println("User details printed to console: " + user);

        return new UserPrincipal(user);
    }
}
