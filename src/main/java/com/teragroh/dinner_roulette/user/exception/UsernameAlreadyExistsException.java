package com.teragroh.dinner_roulette.user.exception;

public class UsernameAlreadyExistsException extends  RuntimeException{
    public UsernameAlreadyExistsException(String message)
    {
        super(message);
    }
}
