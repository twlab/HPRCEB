#!/bin/bash
# Build script for HPRC Epigenome Navigator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"



echo "1. Building data..."
cd "${SCRIPT_DIR}/front/data_source"
bash build.sh


echo "2. Installing dependencies..."
cd "${SCRIPT_DIR}/front"
# npm install --legacy-peer-deps


echo "3. Building for production..."
npm run build

echo ""
echo "Dist output: ${SCRIPT_DIR}/front/dist"


cd "${SCRIPT_DIR}"
rm -rf ./docs
mv ${SCRIPT_DIR}/front/dist ./docs
ECHO "epigenome.humanpangenome.org/" > docs/CNAME

git add docs



