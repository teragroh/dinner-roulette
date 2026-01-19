package com.teragroh.dinner_roulette.user.exception;

public class InvalidCredentialsException extends  RuntimeException {
    public InvalidCredentialsException(String message)
    {
        super(message);
    }
}
