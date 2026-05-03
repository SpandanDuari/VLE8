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

        stage('Deploy GREEN') {
            steps {
                sh '''
                echo "Deploying GREEN container..."

                docker stop green-container || true
                docker rm green-container || true

                docker run -d -p 8008:3000 \
                --name green-container \
                -e VERSION=GREEN \
                $IMAGE
                '''
            }
        }

        stage('Health Check GREEN') {
            steps {
                sh '''
                echo "Checking GREEN health..."

                for i in {1..10}; do
                    if curl -f http://localhost:8008/health; then
                        echo "GREEN is healthy"
                        exit 0
                    fi
                    echo "Retrying in 2 seconds..."
                    sleep 2
                done

                echo "GREEN failed health check"
                docker logs green-container
                exit 1
                '''
            }
        }

        stage('Switch Traffic (BLUE → GREEN)') {
            steps {
                sh '''
                echo "Switching traffic to GREEN..."

                docker stop blue-container || true
                docker rm blue-container || true

                docker run -d -p 8007:3000 \
                --name blue-container \
                -e VERSION=GREEN \
                $IMAGE
                '''
            }
        }
    }

    post {
        failure {
            sh '''
            echo "Deployment failed! Keeping old BLUE running..."
            '''
        }
    }
}