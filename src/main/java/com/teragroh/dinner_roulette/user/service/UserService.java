package com.teragroh.dinner_roulette.user.service;

import com.teragroh.dinner_roulette.user.exception.InvalidCredentialsException;
import com.teragroh.dinner_roulette.user.exception.UsernameAlreadyExistsException;
import com.teragroh.dinner_roulette.user.model.Users;
import com.teragroh.dinner_roulette.user.repository.UserRepo;
import com.teragroh.dinner_roulette.config.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authenticationManager;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users register(Users user){
        try {
            user.setPassword(encoder.encode(user.getPassword()));
            return repo.save(user);
        }
        catch(DataIntegrityViolationException e){
            throw new UsernameAlreadyExistsException("Username already exists");
        }

    }

    public List<Users> getAllUsers(){
        return repo.findAll();
    }

    public String verifyLogin(Users user) {
        try {
            Authentication auth =
                    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername().toLowerCase(), user.getPassword()));

            if (auth.isAuthenticated())
                return jwtService.generateToken(user.getUsername().toLowerCase());
            else throw new InvalidCredentialsException("Invalid username or password");
        }
        catch(AuthenticationException e){
            throw new InvalidCredentialsException("Invalid username or password");
        }


    }
}
