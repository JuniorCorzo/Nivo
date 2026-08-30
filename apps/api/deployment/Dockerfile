# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /workspace

COPY apps/api/gradle             gradle
COPY apps/api/gradlew            gradlew
COPY apps/api/gradle.properties  gradle.properties
COPY apps/api/settings.gradle    settings.gradle
COPY apps/api/build.gradle       build.gradle
COPY apps/api/main.gradle        main.gradle
COPY apps/api/lombok.config      lombok.config

COPY apps/api/applications       applications
COPY apps/api/domain             domain
COPY apps/api/infrastructure     infrastructure

RUN chmod +x gradlew && \
    ./gradlew :app-service:bootJar -x test --no-daemon

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre-alpine AS runtime

RUN addgroup -S nivo && adduser -S nivo -G nivo
USER nivo

WORKDIR /app

COPY --from=builder /workspace/applications/app-service/build/libs/Nivo.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
