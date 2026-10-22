# ===========================================================================
#  Multi stage Docker build for the Spring Boot backend.
#
#  IMPORTANT - build from the REPOSITORY ROOT (not from inside backend/):
#
#      docker build -t lab-exam-backend .
#
#  Render uses exactly this setup:
#      Root directory    = repository root
#      Dockerfile path   = backend/Dockerfile
#      Runtime           = Docker
#      Production branch = main
#
#  Stage 1 builds the jar with Maven + Java 17.
#  Stage 2 is a small Java 17 runtime image that runs the jar as a non-root user.
# ===========================================================================

# ---------- Stage 1: build ----------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# The Aiven CA certificate (public, not a secret) is optional. When it is
# present it is added to a PKCS12 truststore so that the JDBC connection can
# verify the Aiven server certificate.
ARG TRUSTSTORE_PASSWORD=changeit
COPY backend/certs/ ./certs/

# Copy the POM first so the dependency download is cached between builds.
COPY backend/pom.xml ./pom.xml
RUN mvn -B -ntp dependency:go-offline

COPY backend/src ./src
RUN mvn -B -ntp clean package -DskipTests

# Build the truststore: start from the public CA certificates of the JDK and
# add the Aiven certificate when it is available.
RUN keytool -importkeystore -noprompt \
        -srckeystore "$JAVA_HOME/lib/security/cacerts" -srcstoretype JKS -srcstorepass changeit \
        -destkeystore /build/certs/truststore.p12 -deststoretype PKCS12 -deststorepass "$TRUSTSTORE_PASSWORD" \
 && if [ -f /build/certs/ca.crt ]; then \
        keytool -importcert -noprompt -alias aiven-ca -file /build/certs/ca.crt \
          -keystore /build/certs/truststore.p12 -storetype PKCS12 -storepass "$TRUSTSTORE_PASSWORD" \
        && echo "==> Aiven CA certificate imported into truststore.p12"; \
    else \
        echo "==> WARNING: backend/certs/ca.crt not found."; \
        echo "==> The Aiven server certificate cannot be verified until you add it."; \
    fi

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Run the application as a non-root user.
RUN addgroup -S spring && adduser -S spring -G spring spring

COPY --from=build --chown=spring:spring /build/certs/ /app/certs/
COPY --from=build --chown=spring:spring /build/target/lab-exam-backend-*.jar /app/app.jar

USER spring:spring

# The password of the truststore. It is reused from the build stage, so that
# the truststore and the application always use the same one.
# It protects only PUBLIC certificates and is therefore not a secret.
ARG TRUSTSTORE_PASSWORD=changeit

# Render injects PORT. The values below are only defaults and can be
# overwritten in the Render dashboard.
ENV PORT=8080 \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom" \
    SPRING_DATASOURCE_SSL_MODE=VERIFY_IDENTITY \
    SPRING_DATASOURCE_TRUSTSTORE_URL=file:/app/certs/truststore.p12 \
    SPRING_DATASOURCE_TRUSTSTORE_TYPE=PKCS12 \
    SPRING_DATASOURCE_TRUSTSTORE_PASSWORD=${TRUSTSTORE_PASSWORD}

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD wget -q -O - "http://127.0.0.1:${PORT}/api/health" > /dev/null 2>&1 || exit 1

CMD ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
