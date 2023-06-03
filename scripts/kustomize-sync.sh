#!/usr/bin/env bash

file=kustomization.yml

cd k8s

# yq - https://github.com/mikefarah/yq
yq -i 'del(.resources)' $file

for dir in */; do
	dirname=${dir%/}
	kustomize edit add resource "$dirname/**"
	echo "✅ Synced k8s/$dirname/ to $file"
done

prettier --write $file
