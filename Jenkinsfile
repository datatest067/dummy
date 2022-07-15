@Library('javatest') _

pipeline{
    agent any
    stages {
        stage('build') {
            steps{
              script {
                  pwd
                  build.build("test")
                }
            }
        }
         stage('run') {
            steps{
                 script {
                  pwd
                  build.run("test")
                }
               
            }
        }
    }
}
