import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { GlobeAmericasIcon } from '@heroicons/react/24/outline';
import { getGenomeData, getTrackData } from '../utils/genomeDataService';
import type { DataType } from '../utils/genomeDataService';
import { POPULATION_COLORS, POPULATION_NAMES, SUPER_POPULATION_ORDER } from '../utils/constants';
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
// sub-population that has that assay. Colors match the Track Explorer chips.
const DATA_RING: { key: RingKey; label: string; color: string }[] = [
  { key: 'assembly', label: 'Assembly', color: '#3b82f6' },
  { key: 'annotation', label: 'Annotation', color: '#64748b' },
  { key: 'methylation', label: 'Methylation', color: '#06b6d4' },
  { key: 'expression', label: 'Expression', color: '#22c55e' },
  { key: 'chromatin_accessibility', label: 'Chromatin Accessibility', color: '#f97316' },
  { key: 'chromatin_conformation', label: 'Chromatin Conformation', color: '#a855f7' },
];

// Keys follow the `sex` column in the genome metadata; surfaced as "Gender".
const GENDER_SLICES: { key: 'female' | 'male' | 'unknown'; label: string; color: string }[] = [
  { key: 'female', label: 'Female', color: '#f472b6' },
  { key: 'male', label: 'Male', color: '#818cf8' },
  { key: 'unknown', label: 'Unknown/Other', color: '#9ca3af' },
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
  return 12 + Math.sqrt(count) * 2.6;
}

/**
 * Push overlapping dots apart while pulling each back toward its true
 * location. Deterministic, so the layout is stable across renders.
 */
function relaxOverlaps(nodes: SubPopNode[]): void {
  const PAD = 3;
  const LABEL_ROOM = 5;
  for (let iter = 0; iter < 400; iter++) {
    for (const n of nodes) {
      n.x += (n.ax - n.x) * 0.02;
      n.y += (n.ay - n.y) * 0.02;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const minDist = a.r + b.r + PAD + LABEL_ROOM;
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
        const shift = (minDist - dist) / 2;
        const ux = (dx / dist) * shift;
        const uy = (dy / dist) * shift;
        a.x -= ux;
        a.y -= uy;
        b.x += ux;
        b.y += uy;
      }
    }
    for (const n of nodes) {
      n.x = Math.min(WIDTH - n.r - 2, Math.max(n.r + 2, n.x));
      n.y = Math.min(HEIGHT - n.r - 10, Math.max(n.r + 2, n.y));
    }
  }
}

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
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
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

          {/* labels last, so a neighbouring dot can never cover them */}
          {drawOrder.map((node) => {
            const label = `${node.abbr} ${node.count}`;
            const w = label.length * 5.6 + 8;
            const dimmed = isDimmed(node);
            return (
              <Marker key={`label-${node.abbr}`} coordinates={[node.lon, node.lat]}>
                <g
                  transform={`translate(${node.x - node.ax}, ${node.y - node.ay + node.r + 3})`}
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

      {/* Legend row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
        {/* Anatomy of a dot */}
        <div
          className={`flex items-center gap-4 rounded-xl border p-4 ${
            nightMode ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <svg width={112} height={112} viewBox="-56 -56 112 112" aria-hidden="true">
            <g>
              <circle r={44} fill={nightMode ? '#0f172a' : '#ffffff'} />
              {DATA_RING.map((dt, i) => {
                const span = 360 / DATA_RING.length;
                const a0 = i * span - span / 2 + 2;
                const a1 = a0 + span - 4;
                const frac = [1, 1, 1, 0.75, 0.3, 0.9][i];
                return (
                  <g key={dt.key}>
                    <path d={arcPath(26.4, 44, a0, a1)} fill={dt.color} opacity={0.15} />
                    <path d={arcPath(26.4, 26.4 + frac * 17.6, a0, a1)} fill={dt.color} />
                  </g>
                );
              })}
              <path d={arcPath(15.8, 24.2, 0, 190)} fill={GENDER_SLICES[0].color} />
              <path d={arcPath(15.8, 24.2, 190, 360)} fill={GENDER_SLICES[1].color} />
              <circle r={14} fill={POPULATION_COLORS.afr} />
            </g>
          </svg>
          <div className={`text-xs space-y-2 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className={`font-bold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Anatomy of a dot</p>
            <p>
              <strong>Core</strong> — super population
            </p>
            <p>
              <strong>Inner ring</strong> — gender split
            </p>
            <p>
              <strong>Outer petals</strong> — one per assay; petal length is the share of that sub-population with the
              assay
            </p>
            <p className={nightMode ? 'text-gray-500' : 'text-gray-400'}>Dot size scales with sample count</p>
          </div>
        </div>

        {/* Color keys — outermost-last, matching the dot from the core outwards */}
        <div className="space-y-3">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Super population (core)
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {SUPER_POPULATION_ORDER.map((key) => (
                <span key={key} className={`inline-flex items-center gap-1.5 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: POPULATION_COLORS[key] }} />
                  {POPULATION_NAMES[key]}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Gender (inner ring)
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {GENDER_SLICES.map((s) => (
                <span key={s.key} className={`inline-flex items-center gap-1.5 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Assay (outer petals, clockwise from top)
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {DATA_RING.map((dt) => (
                <span key={dt.key} className={`inline-flex items-center gap-1.5 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: dt.color }} />
                  {dt.label}
                </span>
              ))}
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
          Dots are nudged slightly apart where sub-populations would otherwise overlap
        </span>
      </p>
    </div>
  );
}
