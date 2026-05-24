# ====================================================================
# Dockerfile - Backend Spring Boot (multi-etapa)
# Etapa 1: compilacion con Maven
# Etapa 2: imagen de ejecucion minima con JRE 21
# ====================================================================

# Etapa 1: construccion
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Descargar dependencias primero (cache de Docker)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Etapa 2: ejecucion
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
