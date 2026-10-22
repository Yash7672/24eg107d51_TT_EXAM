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

        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            databaseStatus = valid ? "UP" : "DOWN";
            message = valid
                    ? "Application and database are reachable."
                    : "The database connection is not valid.";
        } catch (SQLException ex) {
            databaseStatus = "DOWN";
            message = "Cannot reach the database. " + SafeMessage.databaseFailure();
            // Log the exception type only - the message may contain connection details.
            log.warn("Database health check failed ({})", ex.getClass().getSimpleName());
        }

        return new HealthResponse(applicationName, "UP", databaseStatus, message, Instant.now());
    }
}
