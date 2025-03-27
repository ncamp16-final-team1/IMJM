FROM openjdk:17-jdk-slim
ENV TZ=Asia/Seoul
WORKDIR /app
# 모든 JAR 파일을 디렉토리로 복사 후 이름 변경
COPY build/libs/ /app/
RUN mv $(ls *.jar | head -n 1) app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# 헬스 체크 설정
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
