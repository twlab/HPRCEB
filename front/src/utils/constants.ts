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
    color: "#3e5b95", // Academic blue rgb(62, 91, 149)
  },
  expression: {
    name: "Expression",
    type: "RNA-seq",
    avgSize: 8,
    description: "RNA sequencing data for gene expression quantification",
    color: "#10b981", // Green - colorblind-friendly contrast
  },
  chromatin_accessibility: {
    name: "Chromatin Accessibility",
    type: "Fiber-seq",
    avgSize: 20,
    description: "Single-molecule chromatin accessibility and nucleosome positioning",
    color: "#f59e0b", // Amber/orange for chromatin accessibility
  },
  chromatin_conformation: {
    name: "Chromatin Conformation",
    type: "Omni-C",
    avgSize: 25,
    description: "3D genome organization and chromatin interactions measured by Omni-C",
    color: "#8b5cf6", // Violet for chromatin conformation
  },
};

