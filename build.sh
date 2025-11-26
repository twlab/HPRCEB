#!/bin/bash
# Build script for HPRC Epigenome Navigator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building HPRC Epigenome Navigator..."

# Build data from TSV
echo "1. Building data..."
cd "${SCRIPT_DIR}/front/data_source"
python3 build_data.py

# Copy PCA TSV files to public folder
echo "2. Copying PCA data files..."
cp pca_background.tsv pca_hprc.tsv samples.tsv "${SCRIPT_DIR}/front/public/data/"

# Install dependencies
echo "3. Installing dependencies..."
cd "${SCRIPT_DIR}/front"
npm install --legacy-peer-deps

# Build for production
echo "4. Building for production..."
npm run build

echo ""
echo "✓ Build complete!"
echo "Output: ${SCRIPT_DIR}/front/dist"

