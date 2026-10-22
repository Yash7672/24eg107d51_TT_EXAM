package com.labexam.app.service;

import com.labexam.app.dto.HealthResponse;
import com.labexam.app.exception.SafeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;

/**
 * Builds the answer of the health endpoint.
 *
 * <p>The database is checked with a real connection so that the frontend can
 * show a meaningful "connected / not connected" badge.</p>
 */
@Service
public class HealthService {

    private static final Logger log = LoggerFactory.getLogger(HealthService.class);

    private final DataSource dataSource;
    private final String applicationName;

    public HealthService(DataSource dataSource,
                         @Value("${spring.application.name:lab-exam-backend}") String applicationName) {
        this.dataSource = dataSource;
        this.applicationName = applicationName;
    }

    public HealthResponse check() {
        String databaseStatus;
        String message;
        Long latencyMs = null;

        long startedAt = System.nanoTime();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            latencyMs = (System.nanoTime() - startedAt) / 1_000_000L;
            databaseStatus = valid ? "UP" : "DOWN";
            message = valid
                    ? "The application is running and the database answered in " + latencyMs + " ms."
                    : "The application is running, but the database connection is not valid.";
        } catch (SQLException ex) {
            latencyMs = (System.nanoTime() - startedAt) / 1_000_000L;
            databaseStatus = "DOWN";
            message = "The application is running, but the database cannot be reached. " + SafeMessage.databaseFailure();
            // Log the exception type only - the message may contain connection details.
            log.warn("Database health check failed ({})", ex.getClass().getSimpleName());
        }

        // "status" describes the application itself. The database state is
        // reported separately in the "database" field, so a database outage
        // does not hide the fact that the backend is still running.
        return new HealthResponse(applicationName, "UP", databaseStatus, message, Instant.now(), latencyMs);
    }
}
