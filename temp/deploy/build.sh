#!/bin/bash
PkgName='teprunner-frontend'

Dockerfile='./Dockerfile'
DockerContext=../

BUILDER_IMAGE='node:latest'
echo "Start compiling code..."
docker run --rm -v $(pwd)/../:/data/src -v /root/.npm/_logs:/root/.npm/_logs  -w /data/src/ $BUILDER_IMAGE  /bin/sh -c "npm install && npm run build"
[ $? -ne 0 ] && exit 2
echo "Compile complete"

echo "Start buiding image..."
docker build -f $Dockerfile -t $PkgName $DockerContext
if [ $? -eq 0 ]
then
    echo "Build docker image success"
    exit 0
else
    echo "Build docker image failed"
    exit 1
fi
