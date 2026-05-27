pipeline {
    agent any

    environment {
        REGISTRY = 'your-registry.com'
        FRONTEND_IMAGE = "${env.REGISTRY}/smart-climate-dashboard-frontend"
        BACKEND_IMAGE  = "${env.REGISTRY}/smart-climate-dashboard-backend"
        REGISTRY_CREDENTIALS = 'docker-registry-credentials'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    dir('frontend') {
                        sh "docker build -t ${env.FRONTEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    dir('backend') {
                        sh "docker build -t ${env.BACKEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                script {
                    docker.image('node:20').inside {
                        dir('frontend') {
                            sh 'node --version'
                            sh 'npm --version'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint Backend') {
            steps {
                script {
                    docker.image('node:20').inside {
                        dir('backend') {
                            sh 'node --version'
                            sh 'npm --version'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                echo 'Run frontend tests here'
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Run backend tests here'
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