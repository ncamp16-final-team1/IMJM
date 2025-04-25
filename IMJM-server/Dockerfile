FROM eclipse-temurin:17-jdk-alpine as build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew && ./gradlew bootJar -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=local
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
