pipeline {
    agent any

    environment {
        IMAGE = "spandanduari/vle8-app:${BUILD_NUMBER}"
    }

    stages {

        stage('Clone Code') {
            steps {
                git branch: 'main', url: 'https://github.com/SpandanDuari/VLE8.git'
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build -t $IMAGE app/'
            }
        }

        stage('Docker Login & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    
                    docker tag $IMAGE spandanduari/vle8-app:latest
                    docker push $IMAGE
                    docker push spandanduari/vle8-app:latest
                    '''
                }
            }
        }

        stage('Decide Deployment Color') {
            steps {
                script {
                    def blueRunning = sh(
                        script: "docker ps --filter 'name=blue-container' --format '{{.Names}}'",
                        returnStdout: true
                    ).trim()

                    if (blueRunning == "blue-container") {
                        env.NEW_COLOR = "green"
                        env.OLD_COLOR = "blue"
                        env.NEW_PORT = "8008"
                        env.OLD_PORT = "8007"
                    } else {
                        env.NEW_COLOR = "blue"
                        env.OLD_COLOR = "green"
                        env.NEW_PORT = "8007"
                        env.OLD_PORT = "8008"
                    }

                    echo "Deploying ${env.NEW_COLOR}, replacing ${env.OLD_COLOR}"
                }
            }
        }

        stage('Deploy New Version') {
            steps {
                sh '''
                echo "Deploying $NEW_COLOR container..."

                docker stop ${NEW_COLOR}-container || true
                docker rm ${NEW_COLOR}-container || true

                docker run -d -p ${NEW_PORT}:3000 \
                --name ${NEW_COLOR}-container \
                -e VERSION=${NEW_COLOR^^} \
                $IMAGE
                '''
            }
        }

        stage('Health Check New Version') {
            steps {
                sh '''
                echo "Checking $NEW_COLOR health..."

                for i in {1..10}; do
                    if curl -f http://localhost:${NEW_PORT}/health; then
                        echo "$NEW_COLOR is healthy"
                        exit 0
                    fi
                    echo "Retrying..."
                    sleep 2
                done

                echo "$NEW_COLOR failed health check"
                docker logs ${NEW_COLOR}-container
                exit 1
                '''
            }
        }

        stage('Switch Traffic') {
            steps {
                sh '''
                echo "Switching traffic to $NEW_COLOR..."

                docker stop ${OLD_COLOR}-container || true
                docker rm ${OLD_COLOR}-container || true
                '''
            }
        }
    }

    post {
        failure {
            sh '''
            echo "Deployment failed! Keeping previous version running."
            '''
        }
    }
}