#!/usr/bin/env bash
TAG=${1}
NS=${2}
export BUILD_NUMBER=${TAG}
export NAMESPACE=${NS}
for f in deployments/*.yml
do
  envsubst < $f > “.generated/$(basename $f)”
done
kubectl apply -f .generated/