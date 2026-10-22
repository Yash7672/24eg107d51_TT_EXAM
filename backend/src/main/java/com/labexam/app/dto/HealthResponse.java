package com.labexam.app.dto;

import java.time.Instant;

/**
 * Response body of GET /api/health.
 *
 * @param application        name of the running service
 * @param status             status of the application itself ("UP")
 * @param database           status of the database connection ("UP" or "DOWN")
 * @param message            short human readable explanation
 * @param timestamp          moment the check was executed
 * @param databaseLatencyMs  time the database check needed in milliseconds
 *                           (null when the database could not be reached)
 */
public record HealthResponse(
        String application,
        String status,
        String database,
        String message,
        Instant timestamp,
        Long databaseLatencyMs) {
}
