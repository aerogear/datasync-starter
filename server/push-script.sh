#!/bin/sh

#use TAG env. variable to create the container with the given tag
TAG="${TAG:-latest}"

CONTAINER="aerogear/voyager-server-example-task:$TAG"
echo "Building docker container $CONTAINER"
docker build -f Dockerfile -t "$CONTAINER" . && docker push "$CONTAINER"
