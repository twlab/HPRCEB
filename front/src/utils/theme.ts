/**
 * Design tokens for the portal.
 *
 * Every colour that carries meaning — an assay, a super population, a
 * coordinate system, a sex, the brand itself — is defined here once and
 * imported everywhere else. Before this module the same assay was cyan in the
 * availability matrix, academic blue in the size chart and a primary gradient
 * on a sample row; adding a surface meant guessing which of six palettes to
 * copy.
 *
 * Two rules keep it working:
 *
 * 1. Tailwind class names are written out in full. The v4 JIT compiler scans
 *    source text, so `bg-cyan-100` has to appear literally — a name assembled
 *    from fragments (`` `bg-${family}-100` ``) compiles to nothing.
 * 2. Each `hex` is the Tailwind 500 step of the family named beside it, so the
 *    SVG/canvas surfaces (map glyphs, Chart.js) and the class-based surfaces
 *    (chips, badges) land on the same colour.
 *
 * Known overlap: the coordinate palette (hg38 blue / chm13 emerald / DSA amber)
 * reuses hues that the super-population palette also spends (eur / amr / afr).
 * Both palettes predate this module and are referenced by published figures, so
 * they are left alone; the two only ever share a surface in the availability
 * matrix, where the column headers disambiguate them.
 */

/* -------------------------------------------------------------- the brand */

/** Academic blue. The `primary-*` Tailwind scale in style.css is built from it. */
export const BRAND = {
  /** `primary-600` — the brand itself. */
  hex: '#3e5b95',
  /** `primary-300` — the same blue lifted enough to read on a dark surface. */
  tint: '#9bb0d6',
  /** Bare channel list, for `rgb(...)` / `rgba(...)` interpolation. */
  rgb: '62, 91, 149',
} as const;

/* ------------------------------------------------------------------ assays */

export type DataTypeKey =
  | 'assembly'
  | 'repeatmasker'
  | 'annotation'
  | 'methylation'
  | 'expression'
  | 'chromatin_accessibility'
  | 'chromatin_conformation';

export interface DataTypeToken {
  /** Full name — prose, legends, table headers. */
  label: string;
  /** Abbreviation for narrow columns. */
  short: string;
  /** Canonical hue: the 500 step of `family`. */
  hex: string;
  /** Tailwind family the classes below are drawn from. Documentation only. */
  family: string;
  /** Solid swatch. */
  dot: string;
  /** Resting filter chip. */
  chip: string;
  chipDark: string;
  /** Selected filter chip. */
  chipActive: string;
  chipActiveDark: string;
  /** Tinted pill tagging a row with its assay. */
  badge: string;
  badgeDark: string;
  /** Faint panel tint behind an assay's detail row. */
  panel: string;
  /** Accents for the data-layer picker cards. */
  cardBorder: string;
  cardHoverBorder: string;
  cardGradient: string;
  cardGlow: string;
  /** Availability pip on a sample row. */
  pip: string;
}

export const DATA_TYPES: Record<DataTypeKey, DataTypeToken> = {
  assembly: {
    label: 'Genome Alignment',
    short: 'Align',
    hex: '#3b82f6',
    family: 'blue',
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    chipDark: 'bg-blue-900/30 text-blue-300 border-blue-700 hover:bg-blue-800/40',
    chipActive: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200',
    chipActiveDark: 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/50',
    badge: 'bg-blue-100 text-blue-800',
    badgeDark: 'bg-blue-900/40 text-blue-200',
    panel: 'bg-blue-50',
    cardBorder: 'border-blue-500',
    cardHoverBorder: 'hover:border-blue-300',
    cardGradient: 'from-blue-50 to-blue-100',
    cardGlow: 'shadow-glow-blue',
    pip: 'from-blue-400 to-blue-600',
  },
  repeatmasker: {
    label: 'RepeatMasker',
    short: 'Repeats',
    hex: '#64748b',
    family: 'slate',
    dot: 'bg-slate-500',
    chip: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    chipDark: 'bg-slate-800/40 text-slate-300 border-slate-600 hover:bg-slate-700/40',
    chipActive: 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-200',
    chipActiveDark: 'bg-slate-500 text-white border-slate-400 shadow-md shadow-slate-900/50',
    badge: 'bg-slate-100 text-slate-800',
    badgeDark: 'bg-slate-800/50 text-slate-200',
    panel: 'bg-slate-50',
    cardBorder: 'border-slate-500',
    cardHoverBorder: 'hover:border-slate-300',
    cardGradient: 'from-slate-50 to-slate-100',
    cardGlow: 'shadow-glow-slate',
    pip: 'from-slate-400 to-slate-600',
  },
  annotation: {
    label: 'Annotation',
    short: 'Annot.',
    hex: '#6b7280',
    family: 'gray',
    dot: 'bg-gray-500',
    chip: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
    chipDark: 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50',
    chipActive: 'bg-gray-600 text-white border-gray-600 shadow-md shadow-gray-200',
    chipActiveDark: 'bg-gray-500 text-white border-gray-400 shadow-md shadow-gray-900/50',
    badge: 'bg-gray-100 text-gray-800',
    badgeDark: 'bg-gray-700/60 text-gray-200',
    panel: 'bg-gray-50',
    cardBorder: 'border-gray-500',
    cardHoverBorder: 'hover:border-gray-300',
    cardGradient: 'from-gray-50 to-gray-100',
    cardGlow: 'shadow-glow-gray',
    pip: 'from-gray-400 to-gray-600',
  },
  methylation: {
    label: 'Methylation',
    short: 'Methyl',
    hex: '#06b6d4',
    family: 'cyan',
    dot: 'bg-cyan-500',
    chip: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',
    chipDark: 'bg-cyan-900/30 text-cyan-300 border-cyan-700 hover:bg-cyan-800/40',
    chipActive: 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-200',
    chipActiveDark: 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-900/50',
    badge: 'bg-cyan-100 text-cyan-800',
    badgeDark: 'bg-cyan-900/40 text-cyan-200',
    panel: 'bg-cyan-50',
    cardBorder: 'border-cyan-500',
    cardHoverBorder: 'hover:border-cyan-300',
    cardGradient: 'from-cyan-50 to-cyan-100',
    cardGlow: 'shadow-glow-cyan',
    pip: 'from-cyan-400 to-cyan-600',
  },
  expression: {
    label: 'Expression',
    short: 'Expr',
    hex: '#22c55e',
    family: 'green',
    dot: 'bg-green-500',
    chip: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    chipDark: 'bg-green-900/30 text-green-300 border-green-700 hover:bg-green-800/40',
    chipActive: 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200',
    chipActiveDark: 'bg-green-600 text-white border-green-500 shadow-md shadow-green-900/50',
    badge: 'bg-green-100 text-green-800',
    badgeDark: 'bg-green-900/40 text-green-200',
    panel: 'bg-green-50',
    cardBorder: 'border-green-500',
    cardHoverBorder: 'hover:border-green-300',
    cardGradient: 'from-green-50 to-green-100',
    cardGlow: 'shadow-glow-green',
    pip: 'from-green-400 to-green-600',
  },
  chromatin_accessibility: {
    label: 'Chromatin Accessibility',
    short: 'Access.',
    hex: '#f97316',
    family: 'orange',
    dot: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    chipDark: 'bg-orange-900/30 text-orange-300 border-orange-700 hover:bg-orange-800/40',
    chipActive: 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200',
    chipActiveDark: 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-900/50',
    badge: 'bg-orange-100 text-orange-800',
    badgeDark: 'bg-orange-900/40 text-orange-200',
    panel: 'bg-orange-50',
    cardBorder: 'border-orange-500',
    cardHoverBorder: 'hover:border-orange-300',
    cardGradient: 'from-orange-50 to-orange-100',
    cardGlow: 'shadow-glow-orange',
    pip: 'from-orange-400 to-orange-600',
  },
  chromatin_conformation: {
    label: 'Chromatin Conformation',
    short: 'Conf.',
    hex: '#a855f7',
    family: 'purple',
    dot: 'bg-purple-500',
    chip: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    chipDark: 'bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-800/40',
    chipActive: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200',
    chipActiveDark: 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50',
    badge: 'bg-purple-100 text-purple-800',
    badgeDark: 'bg-purple-900/40 text-purple-200',
    panel: 'bg-purple-50',
    cardBorder: 'border-purple-500',
    cardHoverBorder: 'hover:border-purple-300',
    cardGradient: 'from-purple-50 to-purple-100',
    cardGlow: 'shadow-glow-purple',
    pip: 'from-purple-400 to-purple-600',
  },
};

/** Token for a data type, falling back to `annotation` for unrecognised keys
 *  (tracks.tsv can gain a `data_type` before this table does). */
export function dataTypeToken(key: string): DataTypeToken {
  return DATA_TYPES[key as DataTypeKey] ?? DATA_TYPES.annotation;
}

/** Full label for a data type, falling back to the raw key. */
export function dataTypeLabel(key: string): string {
  return DATA_TYPES[key as DataTypeKey]?.label ?? key;
}

/** Resting / selected chip classes for a data type in the current theme. */
export function dataTypeChip(key: string, nightMode: boolean, active = false): string {
  const t = dataTypeToken(key);
  if (active) return nightMode ? t.chipActiveDark : t.chipActive;
  return nightMode ? t.chipDark : t.chip;
}

/** Tinted pill classes for a data type in the current theme. */
export function dataTypeBadge(key: string, nightMode: boolean): string {
  const t = dataTypeToken(key);
  return nightMode ? t.badgeDark : t.badge;
}

/* ------------------------------------------------------ super populations */

export type SuperPopKey = 'afr' | 'amr' | 'eas' | 'eur' | 'sas';

/**
 * Colourblind-friendly super-population palette. The map cores, the sunburst,
 * the PCA scatter and the availability-matrix badges all read from this.
 */
export const SUPER_POP_HEX: Record<SuperPopKey, string> = {
  afr: '#f59e0b', // amber
  eur: BRAND.hex, // academic blue
  sas: '#8b5cf6', // violet
  eas: '#ec4899', // pink
  amr: '#10b981', // emerald
};

const SUPER_POP_BADGE: Record<SuperPopKey, { light: string; dark: string }> = {
  afr: { light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-900/40 text-amber-200' },
  eur: { light: 'bg-primary-100 text-primary-800', dark: 'bg-primary-900/40 text-primary-200' },
  sas: { light: 'bg-violet-100 text-violet-800', dark: 'bg-violet-900/40 text-violet-200' },
  eas: { light: 'bg-pink-100 text-pink-800', dark: 'bg-pink-900/40 text-pink-200' },
  amr: { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-900/40 text-emerald-200' },
};

const NEUTRAL_BADGE = { light: 'bg-gray-100 text-gray-700', dark: 'bg-gray-700 text-gray-200' };

/** Badge classes for a super-population code (`AFR` or `afr`) in the current theme. */
export function superPopBadge(code: string, nightMode: boolean): string {
  const entry = SUPER_POP_BADGE[code.toLowerCase() as SuperPopKey] ?? NEUTRAL_BADGE;
  return nightMode ? entry.dark : entry.light;
}

/** Display order used across every population breakdown. */
export const SUPER_POP_ORDER: SuperPopKey[] = ['afr', 'eur', 'sas', 'eas', 'amr'];

/* ----------------------------------------------------- coordinate systems */

export type CoordinateKey = 'hg38' | 'chm13' | 'DSA';

const COORDINATE_BADGE: Record<CoordinateKey, { light: string; dark: string }> = {
  hg38: { light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-800/50 text-blue-200' },
  chm13: { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-800/50 text-emerald-200' },
  DSA: { light: 'bg-amber-100 text-amber-800', dark: 'bg-amber-800/50 text-amber-200' },
};

/** Fold the several spellings the TSV uses into the three canonical keys. */
export function normalizeCoordinateKey(coord: string): CoordinateKey {
  if (coord === 'hg38') return 'hg38';
  if (coord === 'chm13' || coord === 't2t-chm13-v2.0') return 'chm13';
  return 'DSA';
}

/** Badge classes for a coordinate system in the current theme. */
export function coordinateBadge(coord: string, nightMode: boolean): string {
  const entry = COORDINATE_BADGE[normalizeCoordinateKey(coord)];
  return nightMode ? entry.dark : entry.light;
}

/* -------------------------------------------------------------------- sex */

export type SexKey = 'female' | 'male' | 'unknown';

export const SEX_HEX: Record<SexKey, string> = {
  female: '#f472b6', // pink-400
  male: '#818cf8', // indigo-400
  unknown: '#9ca3af', // gray-400
};

const SEX_BADGE: Record<SexKey, { light: string; dark: string }> = {
  female: { light: 'bg-pink-100 text-pink-800', dark: 'bg-pink-900/40 text-pink-200' },
  male: { light: 'bg-indigo-100 text-indigo-800', dark: 'bg-indigo-900/40 text-indigo-200' },
  unknown: NEUTRAL_BADGE,
};

export function sexBadge(sex: string, nightMode: boolean): string {
  const entry = SEX_BADGE[(sex.toLowerCase() as SexKey)] ?? SEX_BADGE.unknown;
  return nightMode ? entry.dark : entry.light;
}

/* ----------------------------------------------------------- control sets */

/**
 * The button roles the portal uses. Every call to action should come from here
 * rather than hand-rolling a gradient, so "the blue button" means one thing
 * across all seven tabs.
 */
export const BUTTON = {
  /** Primary call to action. */
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600',
  /** Secondary action, light theme. */
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  /** Secondary action, dark theme. */
  secondaryDark: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
  /** Destructive action. */
  danger: 'bg-red-600 hover:bg-red-700 text-white',
} as const;

export function secondaryButton(nightMode: boolean): string {
  return nightMode ? BUTTON.secondaryDark : BUTTON.secondary;
}
