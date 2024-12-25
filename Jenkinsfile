pipeline {
    agent any
    tools {
        nodejs 'nodejs 20.17'  // 使用之前配置的 Node.js
    }
    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/Hxiaobiao/flower.git', credentialsId: 'github-credentials'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                // 部署到服务器指定目录
                sh '''
                mkdir -p /var/www/html/flower
                cp -r dist/* /var/www/html/flower/
                '''
            }
        }
    }
    post {
        success {
            echo 'Build and deployment succeeded!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}
