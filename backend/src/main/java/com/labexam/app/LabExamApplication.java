package com.labexam.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the backend.
 *
 * <p>Everything under com.labexam.app is scanned automatically, so the
 * controller, service, repository and config classes need no extra annotations.</p>
 */
@SpringBootApplication
public class LabExamApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabExamApplication.class, args);
    }
}
