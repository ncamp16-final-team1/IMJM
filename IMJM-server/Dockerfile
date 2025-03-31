FROM openjdk:17-jdk-slim
ENV TZ=Asia/Seoul
WORKDIR /app
# 정확한 JAR 파일 이름 사용
COPY build/libs/IMJM-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
