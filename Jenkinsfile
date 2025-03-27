pipeline {
    agent any
    
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
        
        stage('Docker Build') {
            steps {
                dir('IMJM-server') {
                    sh 'docker build -t imjm-server:${BUILD_NUMBER} .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker stop imjm-app || true'
                sh 'docker rm imjm-app || true'
                sh 'docker run -d -p 8081:8080 --name imjm-app imjm-server:${BUILD_NUMBER}'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
