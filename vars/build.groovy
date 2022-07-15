def build(dockerImageName)
    {
        pwd
        sh "docker build -t ${dockerImageName} ."
        echo "Image Got Build ${dockerImageName}"
        sh "docker image"
    }

def run(dockerImageName)
{
    sh "docker run -dit ${dockerImageName}"
    sh "docker ps -a"
}


def dockerPush()
    {
        sh "eval `aws ecr get-login | sed 's/-e none//g'`"
        echo "Pushing images to docker repo"
        sh "docker push ${dockerImageName}"
        echo "Pushed to ${dockerImageName}"
        sh "docker rmi ${dockerImageName}"
    }
