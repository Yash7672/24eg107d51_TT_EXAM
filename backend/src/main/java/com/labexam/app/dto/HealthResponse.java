package com.labexam.app.dto;

import java.time.Instant;

/**
 * Response body of GET /api/health.
 *
 * @param application name of the running service
 * @param status      status of the application itself ("UP")
 * @param database    status of the database connection ("UP" or "DOWN")
 * @param message     short human readable explanation
 * @param timestamp   moment the check was executed
 */
public record HealthResponse(
        String application,
        String status,
        String database,
        String message,
        Instant timestamp) {
}
