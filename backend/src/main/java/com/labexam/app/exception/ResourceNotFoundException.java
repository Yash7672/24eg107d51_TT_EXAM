package com.labexam.app.exception;

/**
 * Thrown when a requested record does not exist.
 * The global exception handler turns it into HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
