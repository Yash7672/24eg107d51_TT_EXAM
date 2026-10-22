package com.labexam.app.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Error body returned by the global exception handler.
 *
 * @param timestamp   when the error happened
 * @param status      HTTP status code
 * @param error       short error name
 * @param message     human readable explanation
 * @param path        request path that failed
 * @param fieldErrors validation errors per field (empty when not a validation error)
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {
}
