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

export interface DataAttributes {
  platform: string;
  processing_tool: string;
  file_format: string;
  release_date: string;
  description?: string;
  coverage?: string;
  [key: string]: any;
}

export interface BrowserAttributes {
  reference_genome: string;
  haplotype?: string;
  track_type: string;
  track_name: string;
  url: string;
  [key: string]: any;
}

export interface Track {
  trackName?: string;
  genome?: string;
  trackType?: string;
  sizeBytes?: number;
  sizeGb: number;
  platform: string;
  processingTool: string;
  fileFormat: string;
  releaseDate: string;
  downloadUrl?: string;
  description?: string;
  coverage?: string;
  referenceGenome?: string;
  haplotype?: string;
  dataAttributes?: DataAttributes;
  browserAttributes?: BrowserAttributes;
  browser?: {
    name?: string;
    genome?: string;
    trackType?: string;
    url?: string;
  };
}

export interface DownloadUrls {
  assembly?: string;
  assemblies?: Record<string, string>;
  methylation?: string;
  expression?: string;
  fiberseq?: string;
  [key: string]: string | Record<string, string> | undefined;
}

export interface Genome {
  id: string;
  name: string;
  population: string;  // Legacy field for backward compatibility
  quality: string;
  contigN50: number;
  assemblySize: number;
  methylation: boolean;
  methylationSize?: number;
  expression: boolean;
  expressionSize?: number;
  fiberseq: boolean;  // Legacy field for backward compatibility
  fiberseqSize?: number;
  chromatinAccessibility?: boolean;
  chromatinAccessibilitySize?: number;
  assemblyTrack?: Track;
  assemblyTracks?: Track[];
  methylationTracks?: Track[];
  expressionTracks?: Track[];
  fiberseqTracks?: Track[];  // Legacy field
  chromatinAccessibilityTracks?: Track[];
  downloadUrls?: DownloadUrls;
  metadata?: GenomeMetadata;
  // New fields from updated samples.tsv
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
}

export type Population = 'all' | 'afr' | 'amr' | 'eas' | 'eur' | 'sas';
export type DataLayer = 'methylation' | 'expression' | 'fiberseq';

export interface DataLayerInfo {
  name: string;
  type: string;
  avgSize: number;
  description: string;
  color: string;
}

