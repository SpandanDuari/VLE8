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

        stage('Update GREEN Image') {
            steps {
                sh '''
                kubectl set image deployment/vle8-green \
                vle8=spandanduari/vle8-app:${BUILD_NUMBER} || true
                '''
            }
        }

        stage('Deploy GREEN') {
            steps {
                sh 'kubectl apply -f k8s/green-deployment.yaml'
            }
        }

        stage('Wait for GREEN Ready') {
            steps {
                sh 'kubectl rollout status deployment/vle8-green'
            }
        }

        stage('Approval') {
            steps {
                input message: 'Switch traffic to GREEN?', ok: 'Deploy'
            }
        }

        stage('Switch Traffic') {
            steps {
                sh '''
                kubectl patch service vle8-service \
                -p '{"spec":{"selector":{"app":"vle8","version":"green"}}}'
                '''
            }
        }
    }
}