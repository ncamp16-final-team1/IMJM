FROM openjdk:17-jdk-slim

# 타임존 설정
ENV TZ=Asia/Seoul

WORKDIR /app

# JAR 파일 복사 - 빌드된 JAR 파일명이 일정하지 않을 수 있으므로 app.jar로 복사
COPY build/libs/*.jar app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# 헬스 체크 설정 - 무중단 배포에 중요
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 자바 옵션 최적화 및 애플리케이션 실행
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
