pipeline {
    agent any
    
    environment {
        // 환경 변수 설정
        APP_NAME = 'imjm-app'
        NCP_SERVER_IP = 'localhost' // 젠킨스와 같은 서버에서 실행 중이므로 localhost 사용
        BLUE_PORT = '8081'
        GREEN_PORT = '8082'
        NGINX_PORT = '80'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                dir('IMJM-server') {
                    sh 'chmod +x ./gradlew'
                    sh './gradlew clean build -x test'
                }
            }
        }
        
        stage('Test') {
            steps {
                dir('IMJM-server') {
                    sh './gradlew test'
                }
            }
            post {
                always {
                    junit '**/build/test-results/test/*.xml'
                }
            }
        }
        
        stage('Determine Active Environment') {
            steps {
                script {
                    // 현재 실행 중인 컨테이너 확인
                    def blueRunning = sh(script: "docker ps --filter 'name=${APP_NAME}-blue' --format '{{.Names}}' | wc -l", returnStdout: true).trim()
                    def greenRunning = sh(script: "docker ps --filter 'name=${APP_NAME}-green' --format '{{.Names}}' | wc -l", returnStdout: true).trim()
                    
                    if (blueRunning == '1') {
                        env.ACTIVE_COLOR = 'blue'
                        env.ACTIVE_PORT = BLUE_PORT
                        env.INACTIVE_COLOR = 'green'
                        env.INACTIVE_PORT = GREEN_PORT
                    } else if (greenRunning == '1') {
                        env.ACTIVE_COLOR = 'green'
                        env.ACTIVE_PORT = GREEN_PORT
                        env.INACTIVE_COLOR = 'blue'
                        env.INACTIVE_PORT = BLUE_PORT
                    } else {
                        // 최초 배포 시 블루를 기본으로 사용
                        env.ACTIVE_COLOR = 'none'
                        env.INACTIVE_COLOR = 'blue'
                        env.INACTIVE_PORT = BLUE_PORT
                    }
                    
                    echo "Active environment: ${env.ACTIVE_COLOR} (Port: ${env.ACTIVE_PORT})"
                    echo "Target environment: ${env.INACTIVE_COLOR} (Port: ${env.INACTIVE_PORT})"
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                dir('IMJM-server') {
                    script {
                        // 고유한 태그 생성 (빌드 번호 + Git 해시)
                        def gitCommitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        env.IMAGE_TAG = "${env.BUILD_NUMBER}-${gitCommitHash}"
                        
                        // Docker 이미지 빌드
                        sh "docker build -t ${APP_NAME}:${env.IMAGE_TAG} ."
                    }
                }
            }
        }
        
        stage('Deploy to Inactive Environment') {
            steps {
                script {
                    // 기존 비활성 컨테이너 제거
                    sh "docker stop ${APP_NAME}-${env.INACTIVE_COLOR} || true"
                    sh "docker rm ${APP_NAME}-${env.INACTIVE_COLOR} || true"
                    
                    // 새 컨테이너 시작
                    sh "docker run -d -p ${env.INACTIVE_PORT}:8080 --name ${APP_NAME}-${env.INACTIVE_COLOR} -e SPRING_PROFILES_ACTIVE=prod ${APP_NAME}:${env.IMAGE_TAG}"
                    
                    // 컨테이너 시작 대기
                    sh "sleep 20"
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // 헬스 체크 수행
                    def healthStatus = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://${NCP_SERVER_IP}:${env.INACTIVE_PORT}/actuator/health || echo 'failed'", returnStdout: true).trim()
                    
                    if (healthStatus != '200') {
                        error "Health check failed with status: ${healthStatus}"
                    }
                    
                    echo "Health check passed for ${env.INACTIVE_COLOR} environment"
                }
            }
        }
        
        stage('Switch Traffic') {
            steps {
                script {
                    // Nginx 설정 파일 생성
                    sh """
                    sudo cat > /etc/nginx/conf.d/${APP_NAME}.conf << EOF
server {
    listen ${NGINX_PORT};
    server_name _;
    
    location / {
        proxy_pass http://${NCP_SERVER_IP}:${env.INACTIVE_PORT};
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
    }
}
EOF
                    """
                    
                    // Nginx 설정 갱신
                    sh "sudo nginx -s reload || sudo systemctl restart nginx || sudo service nginx restart"
                    
                    echo "Traffic switched to ${env.INACTIVE_COLOR} environment"
                    
                    // 이전 환경이 있었다면 잠시 대기 후 종료
                    if (env.ACTIVE_COLOR != 'none') {
                        sh "sleep 30" // 이전 요청이 처리될 시간 확보
                        sh "docker stop ${APP_NAME}-${env.ACTIVE_COLOR} || true"
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    // 오래된 이미지 정리 (최근 5개만 유지)
                    sh "docker image prune -af --filter 'until=24h'"
                    
                    // 사용하지 않는 컨테이너 정리
                    sh "docker container prune -f"
                }
            }
        }
    }
    
    post {
        success {
            echo "Deployment successful! Application is running in ${env.INACTIVE_COLOR} environment on port ${env.INACTIVE_PORT}"
        }
        
        failure {
            script {
                echo "Deployment failed! Rolling back if needed..."
                
                // 실패 시 이전 환경으로 롤백 (롤백 가능한 경우)
                if (env.ACTIVE_COLOR != 'none') {
                    sh """
                    sudo cat > /etc/nginx/conf.d/${APP_NAME}.conf << EOF
server {
    listen ${NGINX_PORT};
    server_name _;
    
    location / {
        proxy_pass http://${NCP_SERVER_IP}:${env.ACTIVE_PORT};
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
    }
}
EOF
                    """
                    
                    sh "sudo nginx -s reload || sudo systemctl restart nginx || sudo service nginx restart"
                    echo "Rolled back to ${env.ACTIVE_COLOR} environment"
                }
            }
        }
    }
}
