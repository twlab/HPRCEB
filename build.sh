#!/bin/bash
# Build script for HPRC Epigenome Navigator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV="${1:-DEV}"
if [[ "$ENV" != "PROD" && "$ENV" != "DEV" && "$ENV" != "TEST" ]]; then
  echo "Error: argument must be PROD, DEV, or TEST (got: '$ENV')"
  exit 1
fi
echo "Environment: $ENV"



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

if [[ "$ENV" == "PROD" ]]; then
  DEST="./docs"
else
  DEST="./docs/$(echo "$ENV" | tr '[:upper:]' '[:lower:]')"
fi

rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"
mv "${SCRIPT_DIR}/front/dist" "$DEST"

if [[ "$ENV" == "PROD" ]]; then
  echo "epigenome.humanpangenome.org" > "$DEST/CNAME"
fi

git add docs



