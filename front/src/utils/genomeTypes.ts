// Type definitions for genome data structures

export interface GenomeMetadata {
  sex?: string;
  sequencingCenter?: string;
  tissue?: string;
  collection?: string;
  alternative_id?: string;
  notes?: string;
  biosample_id?: string;
  population_descriptor?: string;
  population_abbreviation?: string;
  trio_available?: boolean;
  family_id?: string;
  paternal_id?: string;
  maternal_id?: string;
  super_population?: string;
  longitude?: string;
  latitude?: string;
  [key: string]: any;
}

export interface Genome {
  id: string;
  name: string;
  biosample_id?: string;
  population_descriptor?: string;
  population_abbreviation?: string;
  trio_available?: boolean;
  family_id?: string;
  paternal_id?: string;
  maternal_id?: string;
  sex?: string;
  super_population?: string;
  longitude?: string;
  latitude?: string;
}

export type Population = 'all' | 'afr' | 'amr' | 'eas' | 'eur' | 'sas';
export type DataLayer = 'methylation' | 'expression' | 'chromatin_accessibility' | 'chromatin_conformation';

export interface DataLayerInfo {
  name: string;
  type: string;
  avgSize: number;
  description: string;
  color: string;
}
