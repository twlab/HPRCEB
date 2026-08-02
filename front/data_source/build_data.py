#!/usr/bin/env python3
"""
Convert TSV source files to browser-friendly JSON format

Reads:
  - samples.tsv: Sample metadata (one line per sample)

Generates:
  - genomes.json: Sample metadata JSON for portal (build.sh symlinks it into
    ../public/data/ alongside the other generated files)

Note: Track data is loaded directly from tracks.tsv in the frontend.

Usage:
    python build_data.py
"""

import csv
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict


def read_samples(samples_file):
    """Read sample metadata from TSV"""
    samples = {}
    
    with open(samples_file, 'r') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            sample_id = row['sample_id']
            samples[sample_id] = {
                'id': sample_id,
                'biosample_id': row.get('biosample_id', ''),
                'population_descriptor': row.get('population_descriptor', ''),
                'population_abbreviation': row.get('population_abbreviation', ''),
                'trio_available': row.get('trio_available', '').upper() == 'TRUE',
                'family_id': row.get('family_id', ''),
                'paternal_id': row.get('paternal_id', ''),
                'maternal_id': row.get('maternal_id', ''),
                'sex': row.get('sex', ''),
                'tissue': row.get('tissue', ''),
                'collection': row.get('collection', ''),
                'alternative_id': row.get('alternative_id', ''),
                'notes': row.get('notes', ''),
                'super_population': row.get('super_population', ''),
                'longitude': row.get('longitude', ''),
                'latitude': row.get('latitude', ''),
                # Legacy fields for backward compatibility
                'name': row.get('sample_id', ''),
                'sequencingCenter': row.get('collection', ''),
            }
    
    return samples


def build_genomes(samples):
    """Build genome objects from sample metadata"""
    genomes = []
    
    for sample_id, sample in samples.items():
        genome = {
            'id': sample['id'],
            'name': sample['name'],
            'biosample_id': sample['biosample_id'],
            'population_descriptor': sample['population_descriptor'],
            'population_abbreviation': sample['population_abbreviation'],
            'trio_available': sample['trio_available'],
            'family_id': sample['family_id'],
            'paternal_id': sample['paternal_id'],
            'maternal_id': sample['maternal_id'],
            'sex': sample['sex'],
            'super_population': sample['super_population'],
            'longitude': sample['longitude'],
            'latitude': sample['latitude']
        }
        
        genomes.append(genome)
    
    # Sort by sample ID
    genomes.sort(key=lambda g: g['id'])
    
    return genomes


def build_json(samples_file, output_file):
    """Main function to build JSON from TSV files"""
    
    print("Reading source files...")
    samples = read_samples(samples_file)
    print(f"  * Loaded {len(samples)} samples from {samples_file.name}")
    
    print("\nBuilding genome data...")
    genomes = build_genomes(samples)
    print(f"  * Generated {len(genomes)} genome entries")
    
    # Create output structure
    output = {
        'description': 'HPRC Year 2 genome sample metadata (track data loaded from tracks.tsv)',
        'genomes': genomes,
    }
    
    # Write JSON file
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n* Generated {output_file}")
    
    # Print summary statistics
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total genomes: {len(genomes)}")
    
    populations = defaultdict(int)
    for g in genomes:
        populations[g['population_abbreviation']] += 1
    
    print(f"\nBy population:")
    for pop, count in sorted(populations.items()):
        print(f"  {pop}: {count}")
    
    print("\n" + "="*60)


if __name__ == '__main__':
    # Set up paths (resolve to absolute paths)
    script_dir = Path(__file__).parent.resolve()
    samples_file = script_dir / 'samples.tsv'
    output_file = script_dir / 'genomes.json'
    
    print(f"Output will be written to: {output_file.resolve()}")
    print()
    
    # Check input files exist
    if not samples_file.exists():
        print(f"Error: {samples_file} not found!")
        exit(1)
    
    # Build JSON
    build_json(samples_file, output_file)
