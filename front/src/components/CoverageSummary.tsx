import { useMemo, useState } from 'react';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import {
  getGenomeData,
  getDataTypeCoverage,
  getSampleDataAvailability,
  DATA_TYPES,
} from '../utils/genomeDataService';
import type { DataType, Coordinate } from '../utils/genomeDataService';

interface CoverageSummaryProps {
  nightMode?: boolean;
}

// Short + full labels and a base color per data type (matches the availability matrix hues)
const DATA_TYPE_META: Record<DataType, { short: string; full: string; color: string }> = {
  assembly: { short: 'Align', full: 'Genome Alignment', color: '#3b82f6' },
  repeatmasker: { short: 'Repeats', full: 'RepeatMasker', color: '#64748b' },
  methylation: { short: 'Methyl', full: 'Methylation', color: '#06b6d4' },
  expression: { short: 'Expr', full: 'Expression', color: '#10b981' },
  chromatin_accessibility: { short: 'Chrom Acc', full: 'Chromatin Accessibility', color: '#f59e0b' },
  chromatin_conformation: { short: 'Chrom Conf', full: 'Chromatin Conformation', color: '#8b5cf6' },
};

// Opacity ramp by number of coordinate systems available (0 = none)
function cellOpacity(size: number): number {
  if (size <= 0) return 0;
  return Math.min(1, 0.4 + 0.3 * size); // 1 -> 0.7, 2 -> 1.0, 3 -> 1.0
}

type SortMode = 'name' | 'coverage';

export default function CoverageSummary({ nightMode = false }: CoverageSummaryProps) {
  const [sortMode, setSortMode] = useState<SortMode>('coverage');

  const genomes = getGenomeData();
  const total = genomes.length;

  const coverage = useMemo(() => getDataTypeCoverage(), [total]);

  // Per-sample availability (size of the coordinate set per data type)
  const rows = useMemo(() => {
    const data = genomes.map((g) => {
      const availability = getSampleDataAvailability(g.id);
      const perType = {} as Record<DataType, number>;
      let typesPresent = 0;
      for (const type of DATA_TYPES) {
        const size = availability[type].size;
        perType[type] = size;
        if (size > 0) typesPresent++;
      }
      return { id: g.id, perType, typesPresent };
    });

    if (sortMode === 'coverage') {
      data.sort((a, b) => b.typesPresent - a.typesPresent || a.id.localeCompare(b.id));
    } else {
      data.sort((a, b) => a.id.localeCompare(b.id));
    }
    return data;
  }, [genomes, sortMode]);

  const card = nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const emptyCell = nightMode ? '#374151' : '#f1f5f9';

  return (
    <div className={`${card} rounded-2xl shadow-fancy border p-6 mb-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <DocumentChartBarIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Data Coverage</h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Assay completeness across {total.toLocaleString()} samples
          </p>
        </div>
      </div>

      {/* Completion bars */}
      <div className="space-y-2.5 mb-6">
        {DATA_TYPES.map((type) => {
          const count = coverage[type] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const meta = DATA_TYPE_META[type];
          return (
            <div key={type} className="flex items-center gap-3">
              <div className={`w-40 flex-shrink-0 text-sm font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {meta.full}
              </div>
              <div className={`flex-1 h-6 rounded-md overflow-hidden ${nightMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: meta.color }}
                >
                  {pct >= 18 && (
                    <span className="text-[11px] font-bold text-white/95 whitespace-nowrap">{pct.toFixed(0)}%</span>
                  )}
                </div>
              </div>
              <div className={`w-24 flex-shrink-0 text-right text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {count.toLocaleString()} / {total.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap header + sort toggle */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>Per-sample heatmap</h3>
        <div className="flex items-center gap-1">
          {(['coverage', 'name'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                sortMode === mode
                  ? nightMode ? 'bg-primary-700 text-white' : 'bg-primary-600 text-white'
                  : nightMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {mode === 'coverage' ? 'By coverage' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className={`rounded-xl border overflow-hidden ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Column headers */}
        <div
          className={`grid sticky top-0 z-10 ${nightMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          style={{ gridTemplateColumns: `minmax(90px, 1.4fr) repeat(${DATA_TYPES.length}, 1fr)` }}
        >
          <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sample
          </div>
          {DATA_TYPES.map((type) => (
            <div
              key={type}
              title={DATA_TYPE_META[type].full}
              className={`px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wide ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {DATA_TYPE_META[type].short}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="max-h-[440px] overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`grid items-center border-t ${nightMode ? 'border-gray-700/60 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
              style={{ gridTemplateColumns: `minmax(90px, 1.4fr) repeat(${DATA_TYPES.length}, 1fr)` }}
            >
              <div className={`px-3 py-1 text-xs font-medium truncate ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {row.id}
              </div>
              {DATA_TYPES.map((type) => {
                const size = row.perType[type];
                const meta = DATA_TYPE_META[type];
                return (
                  <div key={type} className="px-1 py-1 flex justify-center">
                    <div
                      className="w-full h-5 rounded"
                      title={
                        size > 0
                          ? `${row.id} · ${meta.full}: ${size} coordinate system${size > 1 ? 's' : ''}`
                          : `${row.id} · ${meta.full}: no data`
                      }
                      style={{
                        backgroundColor: size > 0 ? meta.color : emptyCell,
                        opacity: size > 0 ? cellOpacity(size) : 1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={`mt-3 flex flex-wrap items-center gap-4 text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="font-semibold">Cell shade = coordinate systems:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: emptyCell }} /> none
        </span>
        {[1, 2, 3].map((n) => (
          <span key={n} className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-500" style={{ backgroundColor: '#6b7280', opacity: cellOpacity(n) }} /> {n}
          </span>
        ))}
      </div>
    </div>
  );
}
