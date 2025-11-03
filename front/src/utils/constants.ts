// Application constants and configuration
import type { DataLayerInfo, Population } from './genomeTypes';

export const POPULATION_NAMES: Record<Population, string> = {
  all: "All Populations",
  afr: "African",
  amr: "American",
  eas: "East Asian",
  eur: "European",
  sas: "South Asian",
};

export const POPULATION_EMOJI: Record<string, string> = {
  afr: '🌍',
  amr: '🌎',
  eas: '🌏',
  eur: '🌍',
  sas: '🌏',
};

export const POPULATION_MAP: Record<string, string> = {
  afr: "AFR",
  amr: "AMR",
  eas: "EAS",
  eur: "EUR",
  sas: "SAS",
};

export const DATA_LAYER_INFO: Record<string, DataLayerInfo> = {
  methylation: {
    name: "DNA Methylation",
    type: "WGBS",
    avgSize: 15,
    description: "Whole genome bisulfite sequencing data for CpG methylation profiling",
    color: "#3b82f6",
  },
  expression: {
    name: "Expression",
    type: "RNA-seq",
    avgSize: 8,
    description: "RNA sequencing data for gene expression quantification",
    color: "#10b981",
  },
  fiberseq: {
    name: "Fiber-seq",
    type: "PacBio",
    avgSize: 20,
    description: "Single-molecule chromatin accessibility and nucleosome positioning",
    color: "#8b5cf6",
  },
  chromatin_accessibility: {
    name: "Chromatin Accessibility",
    type: "Fiber-seq",
    avgSize: 20,
    description: "Single-molecule chromatin accessibility and nucleosome positioning",
    color: "#8b5cf6",
  },
};

