#!/bin/bash

npm ci
npm run build
npm run e2e:browserstack
