// Application constants and configuration
import type { DataLayerInfo, Population } from './genomeTypes';
import { DATA_TYPES, SUPER_POP_HEX, SUPER_POP_ORDER } from './theme';

export const POPULATION_NAMES: Record<Population, string> = {
  all: "All Populations",
  afr: "Africa",
  amr: "Americas",
  eas: "East Asia",
  eur: "Europe",
  sas: "South Asia",
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

// Shared colorblind-friendly palette for super populations. Re-exported from
// utils/theme so the map cores, the sunburst, the PCA scatter and the
// availability-matrix badges cannot drift apart.
export const POPULATION_COLORS: Record<string, string> = SUPER_POP_HEX;

// Display order used across population breakdowns
export const SUPER_POPULATION_ORDER = SUPER_POP_ORDER;

// Assay descriptions. Names and hues come from utils/theme; only the sequencing
// platform and the typical per-sample footprint are specific to this table.
export const DATA_LAYER_INFO: Record<string, DataLayerInfo> = {
  methylation: {
    name: "DNA Methylation",
    type: "ONT / PacBio",
    avgSize: 15,
    description: "CpG methylation profiles called from long reads",
    color: DATA_TYPES.methylation.hex,
  },
  expression: {
    name: DATA_TYPES.expression.label,
    type: "Iso-Seq",
    avgSize: 8,
    description: "Full-length transcript sequencing for gene expression quantification",
    color: DATA_TYPES.expression.hex,
  },
  chromatin_accessibility: {
    name: DATA_TYPES.chromatin_accessibility.label,
    type: "Fiber-seq",
    avgSize: 20,
    description: "Single-molecule chromatin accessibility and nucleosome positioning",
    color: DATA_TYPES.chromatin_accessibility.hex,
  },
  chromatin_conformation: {
    name: DATA_TYPES.chromatin_conformation.label,
    type: "Omni-C",
    avgSize: 25,
    description: "3D genome organization and chromatin interactions measured by Omni-C",
    color: DATA_TYPES.chromatin_conformation.hex,
  },
};

