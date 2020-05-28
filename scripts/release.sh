#!/bin/sh -l

echo "Beginning asset-manager release to $1!"

npm test
npm run lint 

if [[ "$1" == "prod" ]]; then
	echo "Releasing asset-manager to prod"
	# npm run release
	echo "Done releasing asset-manager to prod"
elif [[ "$1" == "staging" ]]; then
	echo "Releasing asset-manager to staging"
	npm run prerelease
	echo "Done releasing asset-manager to staging"
else
	echo "EVOLV_STAGE '$1' not recognized. Doing nothing."
fi
