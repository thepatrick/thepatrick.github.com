#!/bin/bash

mkdir -p images/large
mkdir -p images/small

cd images
node ../decade-image-dl.js
node ../decade-image-resize.js

aws s3 sync . s3://artifact.thepatrick.io/decade/