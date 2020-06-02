#!/bin/bash

echo "Beginning asset-manager release to $EVOLV_STAGE!"

npm ci
npm test
npm run lint 

if [[ "$EVOLV_STAGE" == "prod" ]]; then
	pip install awscli
	echo "Releasing asset-manager to prod"
	npm run release
	echo "Done releasing asset-manager to prod"
elif [[ "$EVOLV_STAGE" == "staging" ]]; then
	pip install awscli
	echo "Releasing asset-manager to staging"
	npm run staging:release
	echo "Done releasing asset-manager to staging"
else
	echo "EVOLV_STAGE '$EVOLV_STAGE' not recognized. Doing nothing."
fi
