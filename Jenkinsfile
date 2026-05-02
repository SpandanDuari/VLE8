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

        stage('Push Image') {
            steps {
                sh '''
                docker tag $IMAGE spandanduari/vle8-app:latest
                docker push $IMAGE
                docker push spandanduari/vle8-app:latest
                '''
            }
        }

        stage('Deploy GREEN') {
            steps {
                sh 'kubectl apply -f k8s/green-deployment.yaml'
            }
        }

        stage('Update GREEN Image') {
            steps {
                sh '''
                kubectl set image deployment/vle8-green \
                vle8=$IMAGE
                '''
            }
        }

        stage('Wait for GREEN Ready') {
            steps {
                sh 'kubectl rollout status deployment/vle8-green'
            }
        }

        stage('Health Check GREEN') {
            steps {
                sh '''
                NODE_IP=$(hostname -I | awk '{print $1}')
                PORT=$(kubectl get svc vle8-service -o jsonpath='{.spec.ports[0].nodePort}')

                echo "Checking health at http://$NODE_IP:$PORT/health"

                curl -f http://$NODE_IP:$PORT/health
                '''
            }
        }

        stage('Auto Switch Traffic') {
            steps {
                sh '''
                kubectl patch service vle8-service \
                -p '{"spec":{"selector":{"app":"vle8","version":"green"}}}'
                '''
            }
        }
    }

    post {
        failure {
            sh '''
            echo "Deployment failed! Rolling back to BLUE..."
            kubectl patch service vle8-service \
            -p '{"spec":{"selector":{"app":"vle8","version":"blue"}}}'
            '''
        }
    }
}