pipeline {
    agent any

    environment {
        // TODO: Set your Docker registry URL (e.g., docker.io/yourusername or ghcr.io/yourorg)
        REGISTRY = 'your-registry.com'
        // Image names – adjust if needed
        FRONTEND_IMAGE = "${env.REGISTRY}/smart-climate-dashboard-frontend"
        BACKEND_IMAGE  = "${env.REGISTRY}/smart-climate-dashboard-backend"
        // Credentials ID in Jenkins for Docker registry login
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
                        // Build Docker image for the frontend
                        sh "docker build -t ${env.FRONTEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    dir('backend') {
                        // Build Docker image for the backend
                        sh "docker build -t ${env.BACKEND_IMAGE}:latest ."
                    }
                }
            }
        }

        // Lint Frontend using Node Docker image
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
        // Lint Backend using Node Docker image
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

        // Frontend Tests – customize as needed
        stage('Frontend Tests') {
            steps {
                echo 'Run frontend tests here (e.g., npm test)'
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Run backend tests here (e.g., pytest)'
            }
        }

        stage('Push Images') {
            steps {
                script {
                    if (env.REGISTRY_CREDENTIALS != 'none' && env.REGISTRY_CREDENTIALS != '') {
                        withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS,
                                         usernameVariable: 'REG_USER',
                                         passwordVariable: 'REG_PASS')]) {
                            sh "docker login ${env.REGISTRY} -u $REG_USER -p $REG_PASS"
                            sh "docker push ${env.FRONTEND_IMAGE}:latest"
                            sh "docker push ${env.BACKEND_IMAGE}:latest"
                        }
                    } else {
                        echo 'Skipping docker login and image push because credentials are set to none.'
                    }
                }
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
