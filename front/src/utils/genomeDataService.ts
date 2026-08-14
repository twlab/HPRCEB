// Genome data service - handles loading and managing genome data
import type { Genome, Population, DataLayer } from './genomeTypes';
import { normalizeCoordinateKey, type CoordinateKey } from './theme';
import { tsvRows } from './tsv';

// In-memory genome data cache
let genomeDataCache: Genome[] = [];

// Track entry from TSV with all fields parsed as-is
export interface TrackEntry {
  sample_id: string;
  data_type: string;
  size_bytes: string;
  data_attributes: Record<string, any>;
  browser_attributes: Record<string, any>;
}

// In-memory track data cache as dictionary keyed by sample_id
let trackDataCache: Record<string, TrackEntry[]> = {};

// Data types we track
export type DataType = 'assembly' | 'repeatmasker' | 'methylation' | 'expression' | 'chromatin_accessibility' | 'chromatin_conformation';
export const DATA_TYPES: DataType[] = ['assembly', 'repeatmasker', 'methylation', 'expression', 'chromatin_accessibility', 'chromatin_conformation'];

// Coordinate types. Defined in utils/theme alongside their badge colours, so
// the set of coordinates and the way they are drawn cannot drift apart.
export type Coordinate = CoordinateKey;

/**
 * Normalize coordinate string to standard format
 * Following the same logic as trackSelection.ts
 */
export const normalizeCoordinate = normalizeCoordinateKey;

/**
 * Check if a sample has data of a specific type available
 */
export function hasDataType(sampleId: string, dataType: DataType): boolean {
  const tracks = trackDataCache[sampleId] || [];
  return tracks.some(t => t.data_type === dataType);
}

/**
 * Get coordinates available for a sample and data type
 */
export function getAvailableCoordinates(sampleId: string, dataType: DataType): Set<Coordinate> {
  const tracks = trackDataCache[sampleId] || [];
  const coords = new Set<Coordinate>();
  
  for (const track of tracks) {
    if (track.data_type !== dataType) continue;
    const coord = track.browser_attributes?.coordinate;
    if (coord) {
      coords.add(normalizeCoordinate(coord));
    }
  }
  
  return coords;
}

/**
 * Get all data availability for a sample
 */
export function getSampleDataAvailability(sampleId: string): Record<DataType, Set<Coordinate>> {
  const availability: Record<DataType, Set<Coordinate>> = {
    assembly: new Set(),
    repeatmasker: new Set(),
    methylation: new Set(),
    expression: new Set(),
    chromatin_accessibility: new Set(),
    chromatin_conformation: new Set(),
  };
  
  const tracks = trackDataCache[sampleId] || [];
  
  for (const track of tracks) {
    const dataType = track.data_type as DataType;
    if (!DATA_TYPES.includes(dataType)) continue;
    
    const coord = track.browser_attributes?.coordinate;
    if (coord) {
      availability[dataType].add(normalizeCoordinate(coord));
    }
  }
  
  return availability;
}

/**
 * Calculate total data size for a sample from track data
 */
export function getSampleDataSize(sampleId: string, dataTypes?: DataType[]): number {
  const tracks = trackDataCache[sampleId] || [];
  const typesToInclude = dataTypes || DATA_TYPES;
  
  let totalBytes = 0;
  for (const track of tracks) {
    if (typesToInclude.includes(track.data_type as DataType)) {
      totalBytes += parseInt(track.size_bytes, 10) || 0;
    }
  }
  
  return totalBytes / (1024 ** 3); // Convert to GB
}

/**
 * Get statistics across all samples
 */
export function getDataStatistics(): {
  totalSamples: number;
  withMethylation: number;
  withExpression: number;
  withChromatinAccessibility: number;
  withChromatinConformation: number;
  totalDataSizeGB: number;
} {
  const sampleIds = Object.keys(trackDataCache);
  
  let withMethylation = 0;
  let withExpression = 0;
  let withChromatinAccessibility = 0;
  let withChromatinConformation = 0;
  let totalBytes = 0;
  
  for (const sampleId of sampleIds) {
    const tracks = trackDataCache[sampleId] || [];
    const dataTypes = new Set(tracks.map(t => t.data_type));
    
    if (dataTypes.has('methylation')) withMethylation++;
    if (dataTypes.has('expression')) withExpression++;
    if (dataTypes.has('chromatin_accessibility')) withChromatinAccessibility++;
    if (dataTypes.has('chromatin_conformation')) withChromatinConformation++;
    
    for (const track of tracks) {
      totalBytes += parseInt(track.size_bytes, 10) || 0;
    }
  }
  
  return {
    totalSamples: genomeDataCache.length,
    withMethylation,
    withExpression,
    withChromatinAccessibility,
    withChromatinConformation,
    totalDataSizeGB: totalBytes / (1024 ** 3),
  };
}

/**
 * Count how many samples have at least one track of each data type.
 * @returns Record of DataType -> number of samples with that data type
 */
export function getDataTypeCoverage(): Record<DataType, number> {
  const coverage = {
    assembly: 0,
    repeatmasker: 0,
    methylation: 0,
    expression: 0,
    chromatin_accessibility: 0,
    chromatin_conformation: 0,
  } as Record<DataType, number>;

  for (const genome of genomeDataCache) {
    const tracks = trackDataCache[genome.id] || [];
    const types = new Set(tracks.map((t) => t.data_type));
    for (const type of DATA_TYPES) {
      if (types.has(type)) coverage[type]++;
    }
  }

  return coverage;
}

/**
 * Load genome data from external JSON file
 * @returns Array of genome objects
 */
export async function loadGenomeData(): Promise<Genome[]> {
  try {
    const response = await fetch('./data/genomes.json');
    if (!response.ok) {
      throw new Error(`Failed to load genome data: ${response.statusText}`);
    }
    const data = await response.json();
    genomeDataCache = data.genomes || [];
    return genomeDataCache;
  } catch (error) {
    console.error('Error loading genome data:', error);
    throw error;
  }
}

/**
 * Get the cached genome data
 * @returns Array of genome objects
 */
export function getGenomeData(): Genome[] {
  return genomeDataCache;
}


export function getFilteredGenomes(searchTerm: string, population: Population): Genome[] {
  return genomeDataCache.filter((genome) => {
    const matchesSearch = genome.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         genome.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (genome.population_abbreviation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (genome.population_descriptor || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use super_population for filtering
    const matchesPopulation = population === "all" || genome.super_population === population;
    
    return matchesSearch && matchesPopulation;
  });
}

/**
 * Calculate total data size for selected genomes and layers
 */
export function calculateTotalSize(selectedGenomes: string[], selectedLayers: DataLayer[]): number {
  let totalSize = 0;
  
  for (const genomeId of selectedGenomes) {
    // Always include assembly size
    totalSize += getSampleDataSize(genomeId, ['assembly']);
    
    // Add selected layer sizes
    for (const layer of selectedLayers) {
      totalSize += getSampleDataSize(genomeId, [layer as DataType]);
    }
  }
  
  return totalSize;
}

/**
 * Load track data from TSV file into a dictionary keyed by sample_id
 * @returns Dictionary of sample_id -> TrackEntry[]
 */
export async function loadTrackData(): Promise<Record<string, TrackEntry[]>> {
  try {
    const response = await fetch('./data/tracks.tsv');
    if (!response.ok) {
      throw new Error(`Failed to load track data: ${response.statusText}`);
    }
    const rows = tsvRows(await response.text());

    // Skip header line, parse all fields as-is
    const tracks: Record<string, TrackEntry[]> = {};
    let skipped = 0;
    for (let i = 1; i < rows.length; i++) {
      const [sample_id, data_type, size_bytes, data_attributes, browser_attributes] = rows[i];

      if (!sample_id || data_attributes === undefined || browser_attributes === undefined) {
        skipped++;
        console.warn(`Skipping malformed track row at line ${i + 1}: expected 5 columns, got ${rows[i].length}`);
        continue;
      }

      try {
        const entry: TrackEntry = {
          sample_id,
          data_type,
          size_bytes,
          data_attributes: JSON.parse(data_attributes),
          browser_attributes: JSON.parse(browser_attributes),
        };

        if (!tracks[sample_id]) {
          tracks[sample_id] = [];
        }
        tracks[sample_id].push(entry);
      } catch (parseError) {
        skipped++;
        console.warn(`Failed to parse track at line ${i + 1}:`, parseError);
      }
    }

    // A handful of bad rows is worth a warning; an empty table means the file
    // is not what we think it is, and silently showing an empty portal is worse
    // than saying so.
    if (rows.length > 1 && Object.keys(tracks).length === 0) {
      throw new Error(`No usable rows in tracks.tsv (${skipped} of ${rows.length - 1} failed to parse)`);
    }

    trackDataCache = tracks;
    return trackDataCache;
  } catch (error) {
    console.error('Error loading track data:', error);
    throw error;
  }
}

/**
 * Get the cached track data
 * @returns Dictionary of sample_id -> TrackEntry[]
 */
export function getTrackData(): Record<string, TrackEntry[]> {
  return trackDataCache;
}
