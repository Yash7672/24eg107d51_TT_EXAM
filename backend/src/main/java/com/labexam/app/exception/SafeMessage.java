package com.labexam.app.exception;

/**
 * Helper that prevents leaking sensitive details in user facing messages.
 *
 * <p>The database driver sometimes includes the full JDBC URL or internal
 * details in the exception message. We return a generic text to the client
 * and keep the real exception in the logs.</p>
 */
public final class SafeMessage {

    private SafeMessage() {
    }

    /**
     * @return a generic message that is safe to send to the browser
     */
    public static String databaseFailure() {
        return "Database connection failed. Check the datasource configuration.";
    }
}
