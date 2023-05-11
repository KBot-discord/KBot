#!/usr/bin/env bash

cd protos

for dir in */; do
	if buf lint .; then
		if buf format . -w; then
			echo "✅ Linted and formatted $dir"
		else
			echo "❌ Failed to format $dir"
			exit 1
		fi
	else
		echo "❌ Failed to lint $dir"
		exit 1
	fi
done
