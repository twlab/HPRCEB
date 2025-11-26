// Genome data service - handles loading and managing genome data
import type { Genome, Population, DataLayer } from './genomeTypes';
import type { TracksProps } from './browserTypes';

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
  selectedGenomes.forEach((genomeId) => {
    const genome = genomeDataCache.find((g) => g.id === genomeId);
    if (genome) {
      totalSize += genome.assemblySize;
      selectedLayers.forEach((layer) => {
        const layerSizeKey = `${layer}Size` as keyof Genome;
        const layerSize = genome[layerSizeKey];
        totalSize += (typeof layerSize === 'number' ? layerSize : 0);
      });
    }
  });
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
