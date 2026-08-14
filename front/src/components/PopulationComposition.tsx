import { useMemo, useState } from 'react';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import { getGenomeData } from '../utils/genomeDataService';
import { POPULATION_COLORS, POPULATION_NAMES, SUPER_POPULATION_ORDER } from '../utils/constants';
import { BRAND } from '../utils/theme';
import type { Population } from '../utils/genomeTypes';

interface PopulationCompositionProps {
  selectedPopulation?: Population;
  onPopulationClick?: (population: Population) => void;
  nightMode?: boolean;
  /** Render as a section inside another card instead of a standalone panel. */
  embedded?: boolean;
}

interface PopNode {
  key: string; // super population code
  name: string;
  color: string;
  count: number;
  children: { abbr: string; count: number }[];
}

// --- geometry helpers ---------------------------------------------------

// angle in degrees, 0 = top, increasing clockwise
function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  const a = (angle * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  a0: number,
  a1: number,
): string {
  // guard against a full 360° segment which would collapse the arc
  if (a1 - a0 >= 360) a1 = a0 + 359.999;
  const [x0o, y0o] = polar(cx, cy, outerR, a0);
  const [x1o, y1o] = polar(cx, cy, outerR, a1);
  const [x1i, y1i] = polar(cx, cy, innerR, a1);
  const [x0i, y0i] = polar(cx, cy, innerR, a0);
  const largeArc = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${x0o} ${y0o}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x0i} ${y0i}`,
    'Z',
  ].join(' ');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 107, g: 114, b: 128 };
}

// mix a hex color toward white (amount 0..1) to get progressively lighter shades
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// --- component ----------------------------------------------------------

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const INNER_R = 58;
const MID_R = 104;
const OUTER_R = 150;

export default function PopulationComposition({
  selectedPopulation = 'all',
  onPopulationClick,
  nightMode = false,
  embedded = false,
}: PopulationCompositionProps) {
  const [hovered, setHovered] = useState<{ name: string; count: number } | null>(null);

  const { nodes, total } = useMemo(() => {
    const genomes = getGenomeData();
    const bySuper = new Map<string, Map<string, number>>();

    for (const g of genomes) {
      const sp = g.super_population;
      if (!sp || !POPULATION_COLORS[sp]) continue; // skip samples without a known super population
      const abbr = g.population_abbreviation || 'Other';
      if (!bySuper.has(sp)) bySuper.set(sp, new Map());
      const inner = bySuper.get(sp)!;
      inner.set(abbr, (inner.get(abbr) || 0) + 1);
    }

    const built: PopNode[] = [];
    let sum = 0;
    for (const key of SUPER_POPULATION_ORDER) {
      const inner = bySuper.get(key);
      if (!inner) continue;
      const children = Array.from(inner.entries())
        .map(([abbr, count]) => ({ abbr, count }))
        .sort((a, b) => b.count - a.count);
      const count = children.reduce((acc, c) => acc + c.count, 0);
      sum += count;
      built.push({
        key,
        name: POPULATION_NAMES[key as Population] ?? key.toUpperCase(),
        color: POPULATION_COLORS[key],
        count,
        children,
      });
    }
    return { nodes: built, total: sum };
  }, []);

  // precompute arc segments
  const segments = useMemo(() => {
    const inner: { path: string; color: string; node: PopNode }[] = [];
    const outer: { path: string; color: string; abbr: string; count: number; superName: string }[] = [];
    let angle = 0;
    for (const node of nodes) {
      const span = total > 0 ? (node.count / total) * 360 : 0;
      const a0 = angle;
      const a1 = angle + span;
      inner.push({ path: arcPath(CX, CY, INNER_R, MID_R, a0, a1), color: node.color, node });

      let childAngle = a0;
      node.children.forEach((child, i) => {
        const cSpan = node.count > 0 ? (child.count / node.count) * span : 0;
        outer.push({
          path: arcPath(CX, CY, MID_R + 2, OUTER_R, childAngle, childAngle + cSpan),
          color: lighten(node.color, Math.min(0.6, 0.1 + i * 0.13)),
          abbr: child.abbr,
          count: child.count,
          superName: node.name,
        });
        childAngle += cSpan;
      });
      angle = a1;
    }
    return { inner, outer };
  }, [nodes, total]);

  const isDimmed = (superKey: string) => selectedPopulation !== 'all' && selectedPopulation !== superKey;

  const handleClick = (superKey: string) => {
    if (!onPopulationClick) return;
    // toggle: clicking the active super population clears the filter
    onPopulationClick((selectedPopulation === superKey ? 'all' : superKey) as Population);
  };

  const card = nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const centerLabel = hovered ? hovered.name : 'Populations';
  // Hovering a slice shows its sample count alongside its share of the cohort.
  const centerValue = hovered
    ? `${hovered.count} · ${total > 0 ? ((hovered.count / total) * 100).toFixed(0) : '0'}%`
    : `${total}`;

  const header = embedded ? (
    <div className="mb-4">
      <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>Population Composition</h3>
      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
        Super population → sub-population breakdown
      </p>
    </div>
  ) : (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
        <ChartPieIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Population Composition</h2>
        <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
          Super population → sub-population breakdown
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={
        embedded
          ? ''
          : `${card} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`
      }
    >
      {header}

      {/* Sunburst on top, legend as a full-width row beneath it */}
      <div className="flex flex-col items-center gap-4">
        {/* Sunburst — viewBox stays at SIZE so `embedded` only scales it down */}
        <div className="relative flex-shrink-0">
          <svg
            width={embedded ? 220 : SIZE}
            height={embedded ? 220 : SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label="Population composition sunburst"
          >
            {/* outer ring: sub populations */}
            {segments.outer.map((seg, i) => (
              <path
                key={`o-${i}`}
                d={seg.path}
                fill={seg.color}
                stroke={nightMode ? '#1f2937' : '#ffffff'}
                strokeWidth={1}
                opacity={isDimmed(nodes.find((n) => n.name === seg.superName)?.key ?? '') ? 0.25 : 1}
                style={{ transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHovered({ name: `${seg.abbr} · ${seg.superName}`, count: seg.count })}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {/* inner ring: super populations */}
            {segments.inner.map((seg, i) => (
              <path
                key={`i-${i}`}
                d={seg.path}
                fill={seg.color}
                stroke={nightMode ? '#1f2937' : '#ffffff'}
                strokeWidth={1.5}
                opacity={isDimmed(seg.node.key) ? 0.3 : 1}
                className={onPopulationClick ? 'cursor-pointer' : ''}
                style={{ transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHovered({ name: seg.node.name, count: seg.node.count })}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleClick(seg.node.key)}
              />
            ))}
            {/* center label */}
            <text x={CX} y={CY - 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: nightMode ? '#e5e7eb' : '#374151' }}>
              {centerLabel}
            </text>
            <text x={CX} y={CY + 16} textAnchor="middle" style={{ fontSize: 16, fontWeight: 800, fill: nightMode ? BRAND.tint : BRAND.hex }}>
              {centerValue}
            </text>
          </svg>
        </div>

        {/* Legend — one row of swatch + name; counts live in the hover label */}
        <div className="w-full flex flex-wrap items-center justify-center gap-1">
          {nodes.map((node) => {
            const active = selectedPopulation === node.key;
            return (
              <button
                key={node.key}
                onClick={() => handleClick(node.key)}
                onMouseEnter={() => setHovered({ name: node.name, count: node.count })}
                onMouseLeave={() => setHovered(null)}
                className={`inline-flex items-center gap-1.5 rounded-lg border transition-all ${
                  embedded ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'
                } ${
                  active
                    ? nightMode ? 'border-primary-500 bg-gray-700/60' : 'border-primary-400 bg-primary-50'
                    : nightMode ? 'border-transparent hover:bg-gray-700/40' : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: node.color }} />
                <span className={`font-semibold whitespace-nowrap ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {node.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {onPopulationClick && (
        <p className={`mt-4 text-center text-xs italic ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Click a super population to filter samples · click again to clear
        </p>
      )}
    </div>
  );
}
