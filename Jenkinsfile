pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "smart-climate-dashboard-frontend"
        BACKEND_IMAGE  = "smart-climate-dashboard-backend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat "docker build -t %FRONTEND_IMAGE%:latest ."
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat "docker build -t %BACKEND_IMAGE%:latest ."
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    bat 'node --version'
                    bat 'npm --version'
                    bat 'npm install'
                }
            }
        }

        stage('Lint Backend') {
            steps {
                dir('backend') {
                    bat 'node --version'
                    bat 'npm --version'
                    bat 'npm install'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                echo 'Frontend tests'
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Backend tests'
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}