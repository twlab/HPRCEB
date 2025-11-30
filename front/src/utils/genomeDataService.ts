// Genome data service - handles loading and managing genome data
import type { Genome, Population, DataLayer } from './genomeTypes';

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

// Coordinate types
export type Coordinate = 'hg38' | 'chm13' | 'DSA';

/**
 * Normalize coordinate string to standard format
 * Following the same logic as trackSelection.ts
 */
export function normalizeCoordinate(coord: string): Coordinate {
  if (coord === 'hg38') return 'hg38';
  if (coord === 'chm13' || coord === 't2t-chm13-v2.0') return 'chm13';
  return 'DSA'; // Diploid Donor-Specific Assembly
}

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

/**
 * Get filtered genomes based on search term and population
 */
export function getFilteredGenomes(searchTerm: string, population: Population): Genome[] {
  return genomeDataCache.filter((genome) => {
    const matchesSearch = genome.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         genome.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (genome.population_abbreviation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (genome.population_descriptor || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Use super_population for filtering if available, otherwise fall back to population
    const genomePopulation = genome.super_population || genome.population;
    const matchesPopulation = population === "all" || genomePopulation === population;
    
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
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    // Skip header line, parse all fields as-is
    const tracks: Record<string, TrackEntry[]> = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const [sample_id, data_type, size_bytes, data_attributes, browser_attributes] = line.split('\t');
      
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
        console.warn(`Failed to parse track at line ${i + 1}:`, parseError);
      }
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
