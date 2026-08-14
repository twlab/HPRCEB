import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { GlobeAmericasIcon } from '@heroicons/react/24/outline';
import { getGenomeData, getTrackData } from '../utils/genomeDataService';
import type { DataType } from '../utils/genomeDataService';
import { POPULATION_COLORS, POPULATION_NAMES, SUPER_POPULATION_ORDER } from '../utils/constants';
import { DATA_TYPES as DATA_TYPE_TOKENS, SEX_HEX } from '../utils/theme';
import type { Population } from '../utils/genomeTypes';

interface PopulationDataMapProps {
  nightMode?: boolean;
  /**
   * Supply both to let a parent own the super-population filter (used on the
   * Sample tab, where the chips also drive sample selection). Omit both and the
   * map filters itself.
   */
  selectedPopulation?: Population;
  onPopulationClick?: (population: Population) => void;
  /** The Sample tab drops the header icon to keep its panels logo-free. */
  showIcon?: boolean;
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WIDTH = 980;
const HEIGHT = 455;
const MAP_SCALE = 185;
const MAP_CENTER: [number, number] = [10, 9];

// `annotation` is a real data type in tracks.tsv (gene, CpG islands, HMM
// Flagger) but is not part of the global DATA_TYPES union, so the ring keys
// are declared here rather than derived from it.
type RingKey = DataType | 'annotation';

// Outer petal ring: one wedge per data type, radial length = fraction of the
// sub-population that has that assay. Labels and colours come from the shared
// assay palette, so a petal matches its chip in the Track Explorer exactly.
// `repeatmasker` is deliberately absent — six petals is already a busy dial and
// repeats are present for essentially every assembly, so the wedge carries no
// information.
const RING_KEYS: RingKey[] = [
  'assembly',
  'annotation',
  'methylation',
  'expression',
  'chromatin_accessibility',
  'chromatin_conformation',
];

const DATA_RING: { key: RingKey; label: string; color: string }[] = RING_KEYS.map((key) => ({
  key,
  label: DATA_TYPE_TOKENS[key].label,
  color: DATA_TYPE_TOKENS[key].hex,
}));

// Keys follow the `sex` column in the genome metadata; surfaced as "Gender".
const GENDER_SLICES: { key: 'female' | 'male' | 'unknown'; label: string; color: string }[] = [
  { key: 'female', label: 'Female', color: SEX_HEX.female },
  { key: 'male', label: 'Male', color: SEX_HEX.male },
  { key: 'unknown', label: 'Unknown/Other', color: SEX_HEX.unknown },
];

// --- Equal Earth projection ---------------------------------------------
// Mirrors d3-geo's geoEqualEarth so dot positions can be computed outside the
// <ComposableMap> render tree (needed for the overlap relaxation below).

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180;

function equalEarthRaw(lonDeg: number, latDeg: number): [number, number] {
  const lambda = lonDeg * RAD;
  const l = Math.asin(M * Math.sin(latDeg * RAD));
  const l2 = l * l;
  const l6 = l2 * l2 * l2;
  return [
    (lambda * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)),
  ];
}

const [CENTER_PX, CENTER_PY] = equalEarthRaw(MAP_CENTER[0], MAP_CENTER[1]);

function project(lon: number, lat: number): [number, number] {
  const [px, py] = equalEarthRaw(lon, lat);
  return [WIDTH / 2 + MAP_SCALE * (px - CENTER_PX), HEIGHT / 2 - MAP_SCALE * (py - CENTER_PY)];
}

// --- arc geometry --------------------------------------------------------
// angle in degrees, 0 = top, increasing clockwise

function polar(r: number, angle: number): [number, number] {
  const a = angle * RAD;
  return [r * Math.sin(a), -r * Math.cos(a)];
}

function arcPath(innerR: number, outerR: number, a0: number, a1: number): string {
  if (a1 - a0 >= 360) a1 = a0 + 359.999;
  const [x0o, y0o] = polar(outerR, a0);
  const [x1o, y1o] = polar(outerR, a1);
  const [x1i, y1i] = polar(innerR, a1);
  const [x0i, y0i] = polar(innerR, a0);
  const largeArc = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${x0o} ${y0o}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x0i} ${y0i}`,
    'Z',
  ].join(' ');
}

// --- graticule -----------------------------------------------------------

function buildGraticule(): string[] {
  const paths: string[] = [];
  for (let lon = -180; lon <= 180; lon += 30) {
    const pts: string[] = [];
    for (let lat = -60; lat <= 80; lat += 5) {
      const [x, y] = project(lon, lat);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    paths.push(`M ${pts.join(' L ')}`);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: string[] = [];
    for (let lon = -180; lon <= 180; lon += 5) {
      const [x, y] = project(lon, lat);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    paths.push(`M ${pts.join(' L ')}`);
  }
  return paths;
}

const GRATICULE = buildGraticule();

// --- data model ----------------------------------------------------------

interface SubPopNode {
  abbr: string;
  descriptor: string;
  superPop: string;
  lon: number;
  lat: number;
  count: number;
  sex: Record<'female' | 'male' | 'unknown', number>;
  coverage: Record<RingKey, number>;
  /** Other sub-populations recorded at this exact coordinate, e.g. the UK diaspora groups. */
  coLocated: string[];
  r: number;
  ax: number; // anchor (true location) in map coordinates
  ay: number;
  x: number; // laid-out dot center after overlap relaxation
  y: number;
}

function radiusFor(count: number): number {
  return 15 + Math.sqrt(count) * 3.2;
}

const LABEL_H = 12;

function labelWidth(node: SubPopNode): number {
  return `${node.abbr} ${node.count}`.length * 5.6 + 8;
}

/** True if this node's label pill (hanging below the dot) would sit on top of
 *  an arrow tip, which would hide the thing the arrow is pointing at. */
function labelCoversArrowTarget(node: SubPopNode, targets: { x: number; y: number }[]): boolean {
  const halfW = labelWidth(node) / 2 + 2;
  const top = node.y + node.r + 1;
  const bottom = node.y + node.r + 3 + LABEL_H + 2;
  return targets.some((t) => Math.abs(t.x - node.x) < halfW && t.y > top && t.y < bottom);
}

const ARROW_HEAD = 7; // length of the arrowhead pointing at a true location
const DOT_PAD = 3; // clear space between two glyphs
const LABEL_ROOM = 4; // extra room so a label pill mostly clears its neighbour

function minSeparation(a: SubPopNode, b: SubPopNode): number {
  return a.r + b.r + DOT_PAD + LABEL_ROOM;
}

function clampToMap(nodes: SubPopNode[]): void {
  for (const n of nodes) {
    n.x = Math.min(WIDTH - n.r - 2, Math.max(n.r + 2, n.x));
    n.y = Math.min(HEIGHT - n.r - 10, Math.max(n.r + 2, n.y));
  }
}

/** One separation sweep. Returns true if any pair still overlapped. */
function separate(nodes: SubPopNode[]): boolean {
  let moved = false;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const minDist = minSeparation(a, b);
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      if (dist >= minDist) continue;
      if (dist < 1e-6) {
        // Co-located populations (e.g. GBR/ITU/STU all sit on the same UK
        // point): fan them out along a fixed angle so the result is stable.
        const angle = ((i * 7 + j * 13) % 360) * RAD;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        dist = 1;
      }
      moved = true;
      const shift = (minDist - dist) / 2;
      const ux = (dx / dist) * shift;
      const uy = (dy / dist) * shift;
      a.x -= ux;
      a.y -= uy;
      b.x += ux;
      b.y += uy;
    }
  }
  return moved;
}

/**
 * Lay the dots out so none overlap while keeping each as close to its true
 * location as packing allows. Deterministic, so the layout is stable across
 * renders.
 *
 * Phase 1 anneals: separation competes with a pull back toward the recorded
 * coordinate, and the pull fades out so dots settle near where they belong.
 * Phase 2 then separates only, which is what actually guarantees the final
 * layout is overlap-free — the pull in phase 1 can otherwise hold two dots
 * inside each other indefinitely.
 */
function relaxOverlaps(nodes: SubPopNode[]): void {
  const ANNEAL = 600;
  for (let iter = 0; iter < ANNEAL; iter++) {
    const pull = 0.03 * (1 - iter / ANNEAL);
    for (const n of nodes) {
      n.x += (n.ax - n.x) * pull;
      n.y += (n.ay - n.y) * pull;
    }
    separate(nodes);
    clampToMap(nodes);
  }
  for (let iter = 0; iter < 400; iter++) {
    if (!separate(nodes)) break;
    clampToMap(nodes);
  }
}

// --- legend swatches -----------------------------------------------------
// Each swatch mimics the part of the glyph it labels, so the key can be read
// straight onto the map: a disc for the core, a ring segment for the gender
// ring, and — most usefully — a wedge sitting at that assay's real clock
// position, since the petal order is fixed and otherwise has to be counted out.

const SWATCH = 20; // px; large enough that a wedge's clock position is readable

function CoreSwatch({ color }: { color: string }) {
  return (
    <svg width={SWATCH} height={SWATCH} viewBox="-10 -10 20 20" aria-hidden="true" className="flex-shrink-0">
      <circle r={6.4} fill={color} />
    </svg>
  );
}

function RingSwatch({ color, nightMode }: { color: string; nightMode: boolean }) {
  const track = nightMode ? '#374151' : '#d7dee7';
  return (
    <svg width={SWATCH} height={SWATCH} viewBox="-10 -10 20 20" aria-hidden="true" className="flex-shrink-0">
      <path d={arcPath(4.6, 8.4, 0, 359.9)} fill={track} />
      <path d={arcPath(4.6, 8.4, 10, 190)} fill={color} />
    </svg>
  );
}

function PetalSwatch({ index, color, nightMode }: { index: number; color: string; nightMode: boolean }) {
  const span = 360 / DATA_RING.length;
  const a0 = index * span - span / 2 + 2;
  const a1 = a0 + span - 4;
  const track = nightMode ? '#374151' : '#d7dee7';
  return (
    <svg width={SWATCH} height={SWATCH} viewBox="-10 -10 20 20" aria-hidden="true" className="flex-shrink-0">
      {/* faint full dial, so the coloured wedge reads as a position on it */}
      {DATA_RING.map((_, i) => {
        const s = i * span - span / 2 + 2;
        return <path key={i} d={arcPath(4.4, 9, s, s + span - 4)} fill={track} />;
      })}
      <path d={arcPath(4.4, 9, a0, a1)} fill={color} />
    </svg>
  );
}

// Illustrative coverage for the anatomy diagram's petals (not real data).
const DEMO_FRACS = [1, 1, 1, 0.75, 0.3, 0.9];

// --- dot glyph -----------------------------------------------------------

interface DotGlyphProps {
  node: SubPopNode;
  nightMode: boolean;
  dimmed: boolean;
  active: boolean;
}

function DotGlyph({ node, nightMode, dimmed, active }: DotGlyphProps) {
  const R = node.r;
  const coreR = R * 0.32;
  const genderInner = R * 0.36;
  const genderOuter = R * 0.55;
  const dataInner = R * 0.6;
  const superColor = POPULATION_COLORS[node.superPop] ?? '#6b7280';
  const ringBg = nightMode ? '#0f172a' : '#ffffff';

  // gender ring
  const genderArcs: { path: string; color: string }[] = [];
  let angle = 0;
  for (const slice of GENDER_SLICES) {
    const n = node.sex[slice.key];
    if (!n) continue;
    const span = (n / node.count) * 360;
    genderArcs.push({ path: arcPath(genderInner, genderOuter, angle, angle + span), color: slice.color });
    angle += span;
  }

  // data availability petals
  const petalSpan = 360 / DATA_RING.length;
  const gap = 4;

  return (
    <g
      opacity={dimmed ? 0.22 : 1}
      style={{ transition: 'opacity 0.25s ease' }}
      transform={active ? 'scale(1.12)' : undefined}
    >
      {/* backing disc so the glyph reads against any landmass */}
      <circle r={R + 1.5} fill={ringBg} opacity={nightMode ? 0.85 : 0.92} />
      <circle r={R + 1.5} fill="none" stroke={superColor} strokeWidth={active ? 2 : 1} opacity={active ? 0.9 : 0.35} />

      {/* outer ring: data availability petals */}
      {DATA_RING.map((dt, i) => {
        const a0 = i * petalSpan - petalSpan / 2 + gap / 2;
        const a1 = a0 + petalSpan - gap;
        const frac = node.count > 0 ? node.coverage[dt.key] / node.count : 0;
        const outer = dataInner + frac * (R - dataInner);
        return (
          <g key={dt.key}>
            <path d={arcPath(dataInner, R, a0, a1)} fill={dt.color} opacity={nightMode ? 0.16 : 0.13} />
            {frac > 0 && <path d={arcPath(dataInner, outer, a0, a1)} fill={dt.color} />}
          </g>
        );
      })}

      {/* middle ring: gender split */}
      {genderArcs.map((arc, i) => (
        <path key={i} d={arc.path} fill={arc.color} />
      ))}

      {/* core: super population */}
      <circle r={coreR} fill={superColor} />
    </g>
  );
}

// --- component -----------------------------------------------------------

export default function PopulationDataMap({
  nightMode = false,
  selectedPopulation,
  onPopulationClick,
  showIcon = true,
}: PopulationDataMapProps) {
  const genomeData = getGenomeData();
  const trackData = getTrackData();

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [ownFilter, setOwnFilter] = useState<Population>('all');

  const controlled = onPopulationClick !== undefined;
  const superFilter = controlled ? selectedPopulation ?? 'all' : ownFilter;
  const setSuperFilter = (next: Population) =>
    controlled ? onPopulationClick!(next) : setOwnFilter(next);

  const { nodes, missingCoords } = useMemo(() => {
    const grouped = new Map<string, SubPopNode>();
    let skipped = 0;

    for (const g of genomeData) {
      const abbr = g.population_abbreviation;
      const superPop = g.super_population;
      const lon = parseFloat(g.longitude ?? '');
      const lat = parseFloat(g.latitude ?? '');
      if (!abbr || abbr === 'N/A' || !superPop || !POPULATION_COLORS[superPop] || isNaN(lon) || isNaN(lat)) {
        skipped++;
        continue;
      }

      let node = grouped.get(abbr);
      if (!node) {
        const [ax, ay] = project(lon, lat);
        node = {
          abbr,
          descriptor: g.population_descriptor || abbr,
          superPop,
          lon,
          lat,
          count: 0,
          sex: { female: 0, male: 0, unknown: 0 },
          coverage: DATA_RING.reduce((acc, d) => ({ ...acc, [d.key]: 0 }), {} as Record<RingKey, number>),
          coLocated: [],
          r: 0,
          ax,
          ay,
          x: ax,
          y: ay,
        };
        grouped.set(abbr, node);
      }

      node.count++;
      const sex = (g.sex || '').toLowerCase();
      if (sex === 'female' || sex === 'male') node.sex[sex]++;
      else node.sex.unknown++;

      const types = new Set((trackData[g.id] ?? []).map((t) => t.data_type));
      for (const { key } of DATA_RING) {
        if (types.has(key)) node.coverage[key]++;
      }
    }

    const built = Array.from(grouped.values());
    for (const n of built) {
      n.r = radiusFor(n.count);
      n.coLocated = built.filter((o) => o !== n && o.lon === n.lon && o.lat === n.lat).map((o) => o.abbr);
    }
    // Lay out the largest dots first so they keep the positions closest to truth.
    built.sort((a, b) => b.count - a.count);
    relaxOverlaps(built);

    return { nodes: built, missingCoords: skipped };
  }, [genomeData, trackData]);

  const totalSamples = nodes.reduce((sum, n) => sum + n.count, 0);
  const activeAbbr = hovered ?? selected;
  const activeNode = nodes.find((n) => n.abbr === activeAbbr) ?? null;
  const selectedNode = nodes.find((n) => n.abbr === selected) ?? null;

  const isDimmed = (node: SubPopNode) => superFilter !== 'all' && node.superPop !== superFilter;

  // Dots that packing pushed clear of their own glyph get an arrow pointing
  // back to the coordinate the samples were actually recorded at. Below this
  // the true location still sits under the pie, where an arrow would point
  // into the dot's own body and mean nothing.
  const strayNodes = nodes.filter((n) => Math.hypot(n.x - n.ax, n.y - n.ay) > n.r + ARROW_HEAD);
  const arrowTargets = strayNodes.map((n) => ({ x: n.ax, y: n.ay }));

  // Smallest / middling / largest sub-population. Used only to size the key's
  // circles, so their relative steps mirror the real spread on the map.
  const sizeScale = useMemo(() => {
    if (nodes.length === 0) return [];
    const counts = nodes.map((n) => n.count).sort((a, b) => a - b);
    return Array.from(
      new Set([counts[0], counts[Math.floor(counts.length / 2)], counts[counts.length - 1]])
    );
  }, [nodes]);

  // Draw order: dimmed first, active last, so the focused dot is never covered.
  const drawOrder = [...nodes].sort((a, b) => {
    const rank = (n: SubPopNode) => (n.abbr === activeAbbr ? 2 : isDimmed(n) ? 0 : 1);
    return rank(a) - rank(b) || b.r - a.r;
  });

  const card = nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const ocean = nightMode ? '#0b1220' : '#f0f7fb';
  const land = nightMode ? '#1e293b' : '#e2e8f0';
  const landStroke = nightMode ? '#0f172a' : '#ffffff';

  return (
    <div className={`${card} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      <div className="flex items-start gap-3 mb-4">
        {showIcon && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <GlobeAmericasIcon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Data Availability by Geography
          </h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
            {nodes.length} sub-populations · {totalSamples} samples · each dot layers gender and assay coverage
          </p>
        </div>
      </div>

      {/* Super population filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...SUPER_POPULATION_ORDER] as Population[]).map((key) => {
          const active = superFilter === key;
          const color = key === 'all' ? '#6b7280' : POPULATION_COLORS[key];
          const count =
            key === 'all'
              ? totalSamples
              : nodes.filter((n) => n.superPop === key).reduce((sum, n) => sum + n.count, 0);
          return (
            <button
              key={key}
              onClick={() => setSuperFilter(active ? 'all' : key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? nightMode
                    ? 'bg-gray-600 border-gray-300 text-white'
                    : 'bg-gray-900 border-gray-900 text-white'
                  : nightMode
                    ? 'bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {key === 'all' ? 'All' : POPULATION_NAMES[key]}
              <span className={active ? 'opacity-70' : 'opacity-50'}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Map. The tooltip is a sibling of the clipped map box so it can spill
          outside the map's rounded/overflow-hidden frame near the edges. */}
      <div className="relative">
      <div
        className="rounded-xl overflow-hidden border"
        style={{ backgroundColor: ocean, borderColor: nightMode ? '#374151' : '#dbeafe' }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: MAP_SCALE, center: MAP_CENTER }}
          width={WIDTH}
          height={HEIGHT}
          style={{ width: '100%', height: 'auto' }}
        >
          <defs>
            <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity={nightMode ? 0.6 : 0.25} />
            </filter>
          </defs>

          {/* graticule */}
          {GRATICULE.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={nightMode ? '#1e293b' : '#dbeafe'} strokeWidth={0.6} />
          ))}

          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: land, stroke: landStroke, strokeWidth: 0.5, outline: 'none' },
                    hover: { fill: land, stroke: landStroke, strokeWidth: 0.5, outline: 'none' },
                    pressed: { fill: land, stroke: landStroke, strokeWidth: 0.5, outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* sub-population dots */}
          {drawOrder.map((node) => (
            <Marker key={node.abbr} coordinates={[node.lon, node.lat]}>
              <g
                transform={`translate(${node.x - node.ax}, ${node.y - node.ay})`}
                className="cursor-pointer"
                filter="url(#dotShadow)"
                onMouseEnter={() => setHovered(node.abbr)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === node.abbr ? null : node.abbr)}
              >
                <DotGlyph
                  node={node}
                  nightMode={nightMode}
                  dimmed={isDimmed(node)}
                  active={node.abbr === activeAbbr}
                />
              </g>
            </Marker>
          ))}

          {/* labels above the dots, so a neighbouring dot can never cover them */}
          {drawOrder.map((node) => {
            const w = labelWidth(node);
            const dimmed = isDimmed(node);
            // A pill normally hangs below its dot, but that is also where a
            // shared coordinate tends to sit (STU's label lands right on the UK
            // point). Flip it above so the arrow tip stays readable.
            const flip =
              labelCoversArrowTarget(node, arrowTargets) && node.y - node.r - LABEL_H - 3 > 2;
            const dy = node.y - node.ay + (flip ? -node.r - 15 : node.r + 3);
            return (
              <Marker key={`label-${node.abbr}`} coordinates={[node.lon, node.lat]}>
                <g
                  transform={`translate(${node.x - node.ax}, ${dy})`}
                  className="pointer-events-none"
                  opacity={dimmed ? 0.3 : 1}
                >
                  <rect
                    x={-w / 2}
                    y={0}
                    width={w}
                    height={12}
                    rx={6}
                    fill={nightMode ? '#0b1220' : '#ffffff'}
                    opacity={0.88}
                    stroke={POPULATION_COLORS[node.superPop]}
                    strokeWidth={0.75}
                  />
                  <text
                    y={9}
                    textAnchor="middle"
                    style={{ fontSize: 9, fontWeight: 700, fill: nightMode ? '#e5e7eb' : '#1f2937' }}
                  >
                    {node.abbr}
                    <tspan style={{ fontWeight: 500, opacity: 0.65 }}> {node.count}</tspan>
                  </text>
                </g>
              </Marker>
            );
          })}

          {/* Arrows from a displaced dot back to its recorded coordinate. Drawn
              in the Marker's frame, so the origin IS the true location: the
              shaft starts at the glyph edge and the head lands on the origin.
              Drawn above the labels — where several sub-populations share one
              coordinate the target often falls under a neighbour's label pill,
              and the whole point of the arrow is that its tip stays visible. */}
          {strayNodes.map((node) => {
            const cx = node.x - node.ax;
            const cy = node.y - node.ay;
            const d = Math.hypot(cx, cy);
            // unit vector pointing from the dot centre back to the origin
            const ux = -cx / d;
            const uy = -cy / d;
            const startX = cx + ux * (node.r + 1.5);
            const startY = cy + uy * (node.r + 1.5);
            const baseX = -ux * ARROW_HEAD;
            const baseY = -uy * ARROW_HEAD;
            const wing = ARROW_HEAD * 0.5;
            const color = POPULATION_COLORS[node.superPop];
            const casing = nightMode ? '#0b1220' : '#ffffff';
            return (
              <Marker key={`arrow-${node.abbr}`} coordinates={[node.lon, node.lat]}>
                <g className="pointer-events-none" opacity={isDimmed(node) ? 0.15 : 0.95}>
                  {/* casing keeps the arrow legible over land, sea and label pills */}
                  <line x1={startX} y1={startY} x2={baseX} y2={baseY} stroke={casing} strokeWidth={3.6} />
                  <line x1={startX} y1={startY} x2={baseX} y2={baseY} stroke={color} strokeWidth={1.4} />
                  <polygon
                    points={`0,0 ${baseX - uy * wing},${baseY + ux * wing} ${baseX + uy * wing},${baseY - ux * wing}`}
                    fill={color}
                    stroke={casing}
                    strokeWidth={0.8}
                  />
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
        </div>

        {/* Hover tooltip */}
        {activeNode && (
          <div
            className={`absolute z-20 pointer-events-none rounded-xl border shadow-xl px-3 py-2.5 text-xs w-80 ${
              nightMode ? 'bg-gray-900/95 border-gray-600 text-gray-100' : 'bg-white/97 border-gray-200 text-gray-800'
            }`}
            style={{
              left: `${(activeNode.x / WIDTH) * 100}%`,
              top: `${(activeNode.y / HEIGHT) * 100}%`,
              transform: `translate(${activeNode.x > WIDTH * 0.6 ? 'calc(-100% - 14px)' : '14px'}, ${
                activeNode.y < HEIGHT * 0.35 ? '-15%' : activeNode.y > HEIGHT * 0.65 ? '-85%' : '-50%'
              })`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: POPULATION_COLORS[activeNode.superPop] }}
              />
              <span className="font-bold">{activeNode.abbr}</span>
              <span className={`ml-auto font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeNode.count} samples
              </span>
            </div>
            <p className={`mb-2 leading-snug ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeNode.descriptor}
            </p>
            {activeNode.coLocated.length > 0 && (
              <p className={`mb-2 leading-snug ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Shares this coordinate with {activeNode.coLocated.join(', ')}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2">
              {GENDER_SLICES.filter((s) => activeNode.sex[s.key] > 0).map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label} {activeNode.sex[s.key]}
                </span>
              ))}
            </div>
            <div className="space-y-1">
              {DATA_RING.map((dt) => {
                const n = activeNode.coverage[dt.key];
                const pct = activeNode.count > 0 ? (n / activeNode.count) * 100 : 0;
                return (
                  <div key={dt.key} className="flex items-center gap-1.5">
                    <span className={`w-[148px] flex-shrink-0 whitespace-nowrap ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dt.label}
                    </span>
                    <span className={`flex-1 h-1.5 rounded-full ${nightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: dt.color }}
                      />
                    </span>
                    <span className="w-9 text-right tabular-nums font-medium flex-shrink-0">
                      {n}/{activeNode.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend — one panel, read from the core outwards like the glyph itself */}
      <div
        className={`mt-4 rounded-xl border overflow-hidden ${
          nightMode ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr]">
          {/* Annotated glyph + size scale */}
          <div className="p-4">
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Anatomy of a dot
            </p>
            <svg width={292} height={150} viewBox="0 0 292 150" role="img" aria-label="How to read a dot">
              {(() => {
                const cx = 62;
                const cy = 72;
                const R = 50;
                const dataInner = R * 0.6;
                const genderInner = R * 0.36;
                const genderOuter = R * 0.55;
                const line = nightMode ? '#4b5563' : '#cbd5e1';
                const term = nightMode ? '#e5e7eb' : '#1f2937';
                const desc = nightMode ? '#9ca3af' : '#6b7280';
                // callout anchors: on the core, the gender ring, and a petal
                const callouts = [
                  { r: 8, angle: 152, ty: 122, term: 'Core', desc: 'super population' },
                  { r: (genderInner + genderOuter) / 2, angle: 106, ty: 92, term: 'Inner ring', desc: 'gender split' },
                  { r: R * 0.86, angle: 52, ty: 40, term: 'Outer petals', desc: 'one wedge per assay' },
                ];
                return (
                  <g>
                    <g transform={`translate(${cx}, ${cy})`}>
                      <circle r={R + 1.5} fill={nightMode ? '#0f172a' : '#ffffff'} />
                      {DATA_RING.map((dt, i) => {
                        const span = 360 / DATA_RING.length;
                        const a0 = i * span - span / 2 + 2;
                        const a1 = a0 + span - 4;
                        const frac = DEMO_FRACS[i] ?? 0.8;
                        return (
                          <g key={dt.key}>
                            <path d={arcPath(dataInner, R, a0, a1)} fill={dt.color} opacity={0.15} />
                            <path d={arcPath(dataInner, dataInner + frac * (R - dataInner), a0, a1)} fill={dt.color} />
                          </g>
                        );
                      })}
                      <path d={arcPath(genderInner, genderOuter, 0, 190)} fill={GENDER_SLICES[0].color} />
                      <path d={arcPath(genderInner, genderOuter, 190, 360)} fill={GENDER_SLICES[1].color} />
                      <circle r={R * 0.32} fill={POPULATION_COLORS.afr} />
                    </g>
                    {callouts.map((c) => {
                      const [px, py] = polar(c.r, c.angle);
                      const ax = cx + px;
                      const ay = cy + py;
                      return (
                        <g key={c.term}>
                          <path
                            d={`M ${ax} ${ay} L ${138} ${c.ty} L ${152} ${c.ty}`}
                            fill="none"
                            stroke={line}
                            strokeWidth={1}
                          />
                          <circle cx={ax} cy={ay} r={1.8} fill={line} />
                          <text x={157} y={c.ty - 1} style={{ fontSize: 11, fontWeight: 700, fill: term }}>
                            {c.term}
                          </text>
                          <text x={157} y={c.ty + 11} style={{ fontSize: 10, fill: desc }}>
                            {c.desc}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
            {/* capped so the `auto` grid column tracks the diagram, not the prose */}
            <p className={`text-[11px] leading-snug mt-1 max-w-[292px] ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Petal length is the share of the sub-population with that assay — a stub means the assay is mostly missing.
            </p>
          </div>

          {/* Colour keys */}
          <div
            className={`p-4 border-t lg:border-t-0 lg:border-l ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-4 gap-y-3 items-start">
              {[
                {
                  head: 'Super population',
                  sub: 'core',
                  items: SUPER_POPULATION_ORDER.map((key) => ({
                    key,
                    label: POPULATION_NAMES[key],
                    swatch: <CoreSwatch color={POPULATION_COLORS[key]} />,
                  })),
                },
                {
                  head: 'Gender',
                  sub: 'inner ring',
                  items: GENDER_SLICES.map((s) => ({
                    key: s.key,
                    label: s.label,
                    swatch: <RingSwatch color={s.color} nightMode={nightMode} />,
                  })),
                },
                {
                  head: 'Assay',
                  sub: 'outer petals',
                  items: DATA_RING.map((dt, i) => ({
                    key: dt.key,
                    label: dt.label,
                    swatch: <PetalSwatch index={i} color={dt.color} nightMode={nightMode} />,
                  })),
                },
              ].map((group) => (
                <div key={group.head} className="contents">
                  <div className="sm:text-right">
                    <p className={`text-[11px] font-bold ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {group.head}
                    </p>
                    <p className={`text-[10px] ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>{group.sub}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
                    {group.items.map((item) => (
                      <span
                        key={item.key}
                        className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${
                          nightMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {item.swatch}
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Size scale, aligned into the same two-column rhythm. These
                  circles are drawn smaller than the real glyphs, so they are
                  labelled by direction rather than with sample counts — a
                  number here would invite measuring against the map. */}
              <div className="sm:text-right">
                <p className={`text-[11px] font-bold ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>Dot size</p>
                <p className={`text-[10px] ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>sample count</p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`text-[10px] ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>Fewer</span>
                {sizeScale.map((n) => {
                  const r = radiusFor(n) * 0.62;
                  return (
                    <svg key={n} width={r * 2} height={r * 2} aria-hidden="true" className="flex-shrink-0">
                      <circle
                        cx={r}
                        cy={r}
                        r={r - 0.75}
                        fill="none"
                        stroke={nightMode ? '#6b7280' : '#9ca3af'}
                        strokeWidth={1.5}
                      />
                    </svg>
                  );
                })}
                <span className={`text-[10px] ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected sub-population detail */}
      {selectedNode && (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            nightMode ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: POPULATION_COLORS[selectedNode.superPop] }}
            >
              {selectedNode.abbr}
            </span>
            <span className={`text-sm font-semibold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {selectedNode.descriptor}
            </span>
            <span className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {selectedNode.count} samples · {selectedNode.sex.female} female / {selectedNode.sex.male} male
            </span>
            <button
              onClick={() => setSelected(null)}
              className={`ml-auto text-xs font-medium ${nightMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DATA_RING.map((dt) => {
              const n = selectedNode.coverage[dt.key];
              const pct = selectedNode.count > 0 ? (n / selectedNode.count) * 100 : 0;
              return (
                <div key={dt.key}>
                  <div className={`text-[10px] font-semibold uppercase tracking-wide mb-1 truncate ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {dt.label}
                  </div>
                  <div className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {n}
                    <span className={`text-xs font-medium ml-1 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      / {selectedNode.count}
                    </span>
                  </div>
                  <div className={`mt-1 h-1.5 rounded-full ${nightMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: dt.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className={`mt-4 text-center text-xs italic ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Hover a dot for the full breakdown · click to pin it below
        {missingCoords > 0 && ` · ${missingCoords} sample${missingCoords === 1 ? '' : 's'} without geographic metadata not shown`}
        <span className="block mt-1">
          Dots are moved apart so none overlap
          {strayNodes.length > 0 && '; where one had to travel beyond its own edge, an arrow points at the recorded location'}
        </span>
      </p>
    </div>
  );
}
