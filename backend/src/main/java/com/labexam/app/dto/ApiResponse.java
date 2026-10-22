package com.labexam.app.dto;

import java.time.Instant;

/**
 * Simple wrapper used for the JSON answers of the CRUD endpoints you add
 * during the exam. Keep one shape for every response so the frontend can
 * always read {@code data}.
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}
