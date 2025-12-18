#!/bin/bash
# Build script for HPRC Epigenome Navigator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


# Build data from TSV
echo "1. Building data..."
cd "${SCRIPT_DIR}/front/data_source"
bash build.sh

# Install dependencies
echo "2. Installing dependencies..."
cd "${SCRIPT_DIR}/front"
npm install --legacy-peer-deps

# Build for production
echo "3. Building for production..."
npm run build

echo ""
echo "✓ Build complete!"
echo "Output: ${SCRIPT_DIR}/front/dist"

