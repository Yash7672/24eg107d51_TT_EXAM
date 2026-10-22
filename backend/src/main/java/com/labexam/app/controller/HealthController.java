package com.labexam.app.controller;

import com.labexam.app.dto.HealthResponse;
import com.labexam.app.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health endpoint used by the frontend and by the hosting platform.
 *
 * <p>GET /api/health</p>
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /**
     * Returns 200 as long as the application itself is running.
     * The database state is reported inside the "database" field of the JSON
     * body, so a temporary database outage does not crash the service.
     */
    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(healthService.check());
    }
}
