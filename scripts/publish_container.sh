#!/bin/sh

[ -z "$CI" ] && echo "This script is meant to run only from CircleCI." && exit 1;
[ -z "$DOCKERHUB_USERNAME" ] && echo "Undefined DOCKERHUB_USERNAME, skipping publish" && exit 1;
[ -z "$DOCKERHUB_PASSWORD" ] && echo "Undefined DOCKERHUB_PASSWORD, skipping publish" && exit 1;

docker login quay.io -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD

#use TAG env. variable to create the container with the given tag
TAG="${TAG:-latest}"

NAMESPACE="graphql"
CONTAINER="quay.io/$NAMESPACE/graphback-runtime:$TAG"
CONTAINER_LATEST="quay.io/$NAMESPACE/graphback-runtime:latest"

echo "Building docker container $CONTAINER"
docker build -f Dockerfile -t "$CONTAINER" . && docker push "$CONTAINER" && \
docker tag "$CONTAINER" "$CONTAINER_LATEST" && docker push "$CONTAINER_LATEST"
