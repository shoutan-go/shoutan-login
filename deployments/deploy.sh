#!/usr/bin/env bash
TAG=${1}
NS=${2}
export BUILD_NUMBER=${TAG}
export NAMESPACE=${NS}
mkdir .generated
for f in deployments/*.yml
do
  envsubst < $f > ".generated/$(basename $f)"
done
kubectl apply -f .generated/