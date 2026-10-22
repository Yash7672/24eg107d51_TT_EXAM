package com.labexam.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration.
 *
 * <p>The frontend runs on a different host (localhost during development,
 * a Netlify URL in production), so the browser has to be told which origins
 * are allowed to call this API.</p>
 *
 * <p>The allowed origins are read from the environment variable
 * {@code APP_CORS_ALLOWED_ORIGINS} (comma separated). Never hardcode the
 * deployed Netlify URL here - set the variable instead.</p>
 *
 * <p>{@code APP_CORS_ALLOWED_ORIGIN_PATTERNS} is an optional second list that
 * accepts wildcards, for example {@code http://192.168.*:[*]} for the local
 * network. Exact origins are checked first, the patterns afterwards.</p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final String[] allowedOriginPatterns;

    public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOrigins,
                      @Value("${app.cors.allowed-origin-patterns:}") String allowedOriginPatterns) {
        this.allowedOrigins = split(allowedOrigins);
        this.allowedOriginPatterns = split(allowedOriginPatterns);
    }

    private static String[] split(String value) {
        return java.util.Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        CorsRegistration registration = registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);

        if (allowedOriginPatterns.length > 0) {
            registration.allowedOriginPatterns(allowedOriginPatterns);
        }
    }
}
