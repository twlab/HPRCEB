#!/bin/bash
# Quick build script for generating genomes.json from TSV files

set -e

echo "============================================================"
echo "HPRC Year 2 Portal - Data Builder"
echo "============================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "samples.tsv" ] || [ ! -f "tracks.tsv" ]; then
    echo "Error: Must run from data_source/ directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Run the build script
python3 build_data.py
python3 build_track.py
cp pca_background.tsv pca_hprc.tsv samples.tsv tracks.tsv ../public/data/


