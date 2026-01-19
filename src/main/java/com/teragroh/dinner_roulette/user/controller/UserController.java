package com.teragroh.dinner_roulette.user.controller;

import com.teragroh.dinner_roulette.user.model.Users;
import com.teragroh.dinner_roulette.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Users register(@RequestBody @Valid Users user){
        return userService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody Users user){
        return userService.verifyLogin(user);
    }

    @GetMapping("/users")
    public List<Users> users(){
        return userService.getAllUsers();
    }


}
