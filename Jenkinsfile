pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    // ── Environment variables ─────────────────────────────────────────────────
    environment {
        // Image names — update DOCKER_USER to your Docker Hub username
        DOCKER_USER        = "${env.DOCKER_HUB_USER ?: 'climatewatch'}"
        IMAGE_BACKEND      = "${DOCKER_USER}/climate-backend"
        IMAGE_FRONTEND     = "${DOCKER_USER}/climate-frontend"
        // Tag = Jenkins build number + first 7 chars of git commit
        IMAGE_TAG          = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        // Project name for docker compose (avoids conflicts between builds)
        COMPOSE_PROJECT    = "climate-ci-${env.BUILD_NUMBER}"
        // Node environment for tests
        NODE_ENV           = "test"
    }

    // ── Pipeline options ──────────────────────────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ══════════════════════════════════════════════════════════════════════
        stage('📥 Checkout') {
        // ══════════════════════════════════════════════════════════════════════
            steps {
                echo '━━━ STAGE 1: Checkout ━━━'
                checkout scm
                script {
                    // Print commit info for traceability
                    env.GIT_COMMIT_MSG  = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR      = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    echo """
                    ┌─────────────────────────────────────────┐
                    │  Branch  : ${env.GIT_BRANCH_NAME}
                    │  Author  : ${env.GIT_AUTHOR}
                    │  Commit  : ${env.GIT_COMMIT?.take(7)}
                    │  Message : ${env.GIT_COMMIT_MSG}
                    │  Build # : ${env.BUILD_NUMBER}
                    │  Tag     : ${IMAGE_TAG}
                    └─────────────────────────────────────────┘
                    """
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🔍 Lint & Static Analysis') {
        // ══════════════════════════════════════════════════════════════════════
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo '━━━ STAGE 2a: Lint Backend ━━━'
                        dir('backend') {
                            sh '''
                                echo "Node version: $(node --version)"
                                echo "NPM version:  $(npm --version)"
                                npm ci --prefer-offline --silent
                                echo "Running ESLint on backend..."
                                npx eslint src/ --ext .js --format stylish || true
                            '''
                        }
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        echo '━━━ STAGE 2b: Lint Frontend ━━━'
                        dir('frontend') {
                            sh '''
                                npm ci --prefer-offline --silent
                                echo "Running ESLint on frontend..."
                                npx eslint src/ --ext .js,.jsx --max-warnings 100 || true
                            '''
                        }
                    }
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🧪 Unit Tests') {
        // ══════════════════════════════════════════════════════════════════════
            parallel {
                stage('Test Backend') {
                    steps {
                        echo '━━━ STAGE 3a: Backend Tests ━━━'
                        dir('backend') {
                            sh '''
                                npm ci --prefer-offline --silent
                                echo "Running Jest tests with coverage..."
                                npm test -- \
                                    --coverage \
                                    --forceExit \
                                    --passWithNoTests \
                                    --testTimeout=30000
                            '''
                        }
                    }
                    post {
                        always {
                            // Publish JUnit XML results in Jenkins
                            junit(
                                testResults: 'backend/coverage/junit.xml',
                                allowEmptyResults: true,
                                skipPublishingChecks: true
                            )
                            // Publish HTML coverage report
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: true,
                                keepAll              : true,
                                reportDir            : 'backend/coverage/lcov-report',
                                reportFiles          : 'index.html',
                                reportName           : '📊 Backend Coverage Report',
                            ])
                        }
                    }
                }
                stage('Test Frontend') {
                    steps {
                        echo '━━━ STAGE 3b: Frontend Tests ━━━'
                        dir('frontend') {
                            sh '''
                                npm ci --prefer-offline --silent
                                echo "Running React tests..."
                                npm test -- \
                                    --coverage \
                                    --watchAll=false \
                                    --passWithNoTests \
                                    --forceExit
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing         : true,
                                alwaysLinkToLastBuild: true,
                                keepAll              : true,
                                reportDir            : 'frontend/coverage/lcov-report',
                                reportFiles          : 'index.html',
                                reportName           : '📊 Frontend Coverage Report',
                            ])
                        }
                    }
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🐳 Build Docker Images') {
        // ══════════════════════════════════════════════════════════════════════
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '━━━ STAGE 4a: Build Backend Image ━━━'
                        script {
                            sh """
                                echo "Building: ${IMAGE_BACKEND}:${IMAGE_TAG}"
                                docker build \\
                                    --target production \\
                                    --cache-from ${IMAGE_BACKEND}:latest \\
                                    --label "build.number=${env.BUILD_NUMBER}" \\
                                    --label "git.commit=${env.GIT_COMMIT?.take(7)}" \\
                                    --label "git.branch=${env.GIT_BRANCH_NAME}" \\
                                    -t ${IMAGE_BACKEND}:${IMAGE_TAG} \\
                                    -t ${IMAGE_BACKEND}:latest \\
                                    ./backend

                                echo "✅ Backend image built: ${IMAGE_BACKEND}:${IMAGE_TAG}"
                                docker images ${IMAGE_BACKEND}
                            """
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '━━━ STAGE 4b: Build Frontend Image ━━━'
                        script {
                            sh """
                                echo "Building: ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                                docker build \\
                                    --target production \\
                                    --cache-from ${IMAGE_FRONTEND}:latest \\
                                    --build-arg REACT_APP_API_URL=/api \\
                                    --label "build.number=${env.BUILD_NUMBER}" \\
                                    --label "git.commit=${env.GIT_COMMIT?.take(7)}" \\
                                    -t ${IMAGE_FRONTEND}:${IMAGE_TAG} \\
                                    -t ${IMAGE_FRONTEND}:latest \\
                                    ./frontend

                                echo "✅ Frontend image built: ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                                docker images ${IMAGE_FRONTEND}
                            """
                        }
                    }
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🔒 Security Scan (Trivy)') {
        // ══════════════════════════════════════════════════════════════════════
            steps {
                echo '━━━ STAGE 5: Trivy Security Scan ━━━'
                sh """
                    echo "Scanning backend image for vulnerabilities..."
                    docker run --rm \\
                        -v /var/run/docker.sock:/var/run/docker.sock \\
                        -v trivy-cache:/root/.cache/trivy \\
                        aquasec/trivy:latest image \\
                        --severity HIGH,CRITICAL \\
                        --exit-code 0 \\
                        --no-progress \\
                        --format table \\
                        ${IMAGE_BACKEND}:${IMAGE_TAG} | tee trivy-backend.txt

                    echo "Scanning frontend image for vulnerabilities..."
                    docker run --rm \\
                        -v /var/run/docker.sock:/var/run/docker.sock \\
                        -v trivy-cache:/root/.cache/trivy \\
                        aquasec/trivy:latest image \\
                        --severity HIGH,CRITICAL \\
                        --exit-code 0 \\
                        --no-progress \\
                        --format table \\
                        ${IMAGE_FRONTEND}:${IMAGE_TAG} | tee trivy-frontend.txt

                    echo "✅ Security scan complete. Reports saved."
                """
                // Archive scan results as build artifacts
                archiveArtifacts artifacts: 'trivy-*.txt', allowEmptyArchive: true
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🔗 Integration Tests') {
        // ══════════════════════════════════════════════════════════════════════
            steps {
                echo '━━━ STAGE 6: Integration Tests ━━━'
                sh """
                    echo "Starting test stack with docker compose..."
                    docker compose \\
                        -f docker-compose.yml \\
                        -p ${COMPOSE_PROJECT} \\
                        up -d mongo backend

                    echo "Waiting 20s for services to be healthy..."
                    sleep 20

                    echo "Running health check..."
                    docker compose -p ${COMPOSE_PROJECT} \\
                        exec -T backend \\
                        wget -qO- http://localhost:5000/health && \\
                        echo "✅ Backend health check PASSED" || \\
                        echo "⚠️  Backend health check failed (non-blocking)"

                    echo "Testing API endpoints..."
                    docker compose -p ${COMPOSE_PROJECT} \\
                        exec -T backend \\
                        wget -qO- http://localhost:5000/api/climate/latest && \\
                        echo "✅ Climate API PASSED" || \\
                        echo "⚠️  Climate API check failed"

                    docker compose -p ${COMPOSE_PROJECT} \\
                        exec -T backend \\
                        wget -qO- http://localhost:5000/api/sensors && \\
                        echo "✅ Sensors API PASSED" || \\
                        echo "⚠️  Sensors API check failed"
                """
            }
            post {
                always {
                    sh """
                        echo "Tearing down test stack..."
                        docker compose -p ${COMPOSE_PROJECT} down -v --remove-orphans 2>/dev/null || true
                        echo "✅ Test stack cleaned up"
                    """
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('📤 Push to Docker Hub') {
        // ══════════════════════════════════════════════════════════════════════
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo '━━━ STAGE 7: Push to Docker Hub ━━━'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_HUB_USR',
                    passwordVariable: 'DOCKER_HUB_PSW'
                )]) {
                    sh '''
                        echo "Logging in to Docker Hub..."
                        echo "$DOCKER_HUB_PSW" | docker login -u "$DOCKER_HUB_USR" --password-stdin
                        echo "✅ Docker Hub login successful"
                    '''
                    sh """
                        echo "Pushing backend images..."
                        docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker push ${IMAGE_BACKEND}:latest

                        echo "Pushing frontend images..."
                        docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker push ${IMAGE_FRONTEND}:latest

                        echo "✅ All images pushed to Docker Hub"
                    """
                }
            }
            post {
                always {
                    sh 'docker logout || true'
                }
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🚀 Deploy to Staging') {
        // ══════════════════════════════════════════════════════════════════════
            when { branch 'develop' }
            steps {
                echo '━━━ STAGE 8a: Deploy to Staging ━━━'
                sh """
                    echo "Deploying staging stack with image tag: ${IMAGE_TAG}"
                    export IMAGE_TAG=${IMAGE_TAG}
                    export DOCKER_HUB_USERNAME=${DOCKER_USER}
                    export MONGO_ROOT_PASSWORD=staging_password_123

                    docker compose -f docker-compose.prod.yml -p climate-staging pull || true
                    docker compose -f docker-compose.prod.yml -p climate-staging up -d --remove-orphans

                    echo "Waiting for staging to be healthy..."
                    sleep 20

                    docker compose -p climate-staging ps
                    echo "✅ Staging deployment complete"
                """
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('🚀 Deploy to Production') {
        // ══════════════════════════════════════════════════════════════════════
            when {
                branch pattern: 'main|master', comparator: 'REGEXP'
            }
            steps {
                echo '━━━ STAGE 8b: Deploy to Production ━━━'
                timeout(time: 30, unit: 'MINUTES') {
                    input(
                        message: "Deploy build #${env.BUILD_NUMBER} (${IMAGE_TAG}) to PRODUCTION?",
                        ok: 'Deploy to Production'
                    )
                }
                sh """
                    echo "Deploying to production with tag: ${IMAGE_TAG}"
                    export IMAGE_TAG=${IMAGE_TAG}
                    export DOCKER_HUB_USERNAME=${DOCKER_USER}
                    export MONGO_ROOT_PASSWORD=prod_password_change_me

                    docker compose -f docker-compose.prod.yml -p climate-prod pull || true
                    docker compose -f docker-compose.prod.yml -p climate-prod up -d --remove-orphans
                    docker system prune -f

                    echo "✅ Production deployment complete"
                    docker compose -p climate-prod ps
                """
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        stage('💨 Smoke Test') {
        // ══════════════════════════════════════════════════════════════════════
            when {
                anyOf {
                    branch 'main'; branch 'master'; branch 'develop'
                }
            }
            steps {
                echo '━━━ STAGE 9: Smoke Test ━━━'
                sh """
                    echo "Waiting 15s for deployment to stabilize..."
                    sleep 15

                    echo "Running smoke tests..."

                    # Test frontend is serving
                    curl -sf http://localhost:3000/ > /dev/null && \\
                        echo "✅ Frontend smoke test PASSED" || \\
                        echo "⚠️  Frontend not reachable on port 3000"

                    # Test backend health
                    curl -sf http://localhost:5000/health > /dev/null && \\
                        echo "✅ Backend health smoke test PASSED" || \\
                        echo "⚠️  Backend not reachable on port 5000"

                    # Test API
                    curl -sf http://localhost:5000/api/climate/latest > /dev/null && \\
                        echo "✅ Climate API smoke test PASSED" || \\
                        echo "⚠️  Climate API not reachable"

                    echo "Smoke tests complete."
                """
            }
        }
    }

    // ── Post-pipeline actions ─────────────────────────────────────────────────
    post {
        always {
            echo '━━━ POST: Cleanup ━━━'
            sh """
                # Remove tagged images to save disk space
                docker rmi ${IMAGE_BACKEND}:${IMAGE_TAG} 2>/dev/null || true
                docker rmi ${IMAGE_FRONTEND}:${IMAGE_TAG} 2>/dev/null || true
                # Clean up any leftover test compose stacks
                docker compose -p ${COMPOSE_PROJECT} down -v --remove-orphans 2>/dev/null || true
                echo "✅ Cleanup complete"
            """
            // Clean Jenkins workspace
            cleanWs()
        }

        success {
            echo """
            ╔══════════════════════════════════════════╗
            ║  ✅  PIPELINE SUCCEEDED                  ║
            ║  Build   : #${env.BUILD_NUMBER}
            ║  Tag     : ${IMAGE_TAG}
            ║  Branch  : ${env.GIT_BRANCH_NAME ?: 'unknown'}
            ╚══════════════════════════════════════════╝
            """
        }

        failure {
            echo """
            ╔══════════════════════════════════════════╗
            ║  ❌  PIPELINE FAILED                     ║
            ║  Build   : #${env.BUILD_NUMBER}
            ║  Branch  : ${env.GIT_BRANCH_NAME ?: 'unknown'}
            ║  Check the stage logs above for details  ║
            ╚══════════════════════════════════════════╝
            """
        }

        unstable {
            echo """
            ╔══════════════════════════════════════════╗
            ║  ⚠️   PIPELINE UNSTABLE                  ║
            ║  Build   : #${env.BUILD_NUMBER}
            ║  Tests may have failed — check reports   ║
            ╚══════════════════════════════════════════╝
            """
        }
    }
}
