// Genome data service - handles loading and managing genome data
import type { Genome, Population, DataLayer } from './genomeTypes';

// In-memory genome data cache
let genomeDataCache: Genome[] = [];

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
 * Get data layer availability for a specific genome
 */
export function getDataLayerAvailability(genomeId: string, dataLayer: DataLayer): boolean {
  const genome = genomeDataCache.find((g) => g.id === genomeId);
  return genome ? genome[dataLayer] : false;
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
 * Get a specific genome by ID
 */
export function getGenomeById(genomeId: string): Genome | undefined {
  return genomeDataCache.find(g => g.id === genomeId);
}

