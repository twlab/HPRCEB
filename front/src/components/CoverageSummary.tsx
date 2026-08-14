import { useMemo, useState } from 'react';
import { ChevronRightIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import {
  getGenomeData,
  getDataTypeCoverage,
  getSampleDataAvailability,
  DATA_TYPES,
} from '../utils/genomeDataService';
import type { DataType } from '../utils/genomeDataService';
import { dataTypeToken } from '../utils/theme';

interface CoverageSummaryProps {
  nightMode?: boolean;
  /** Render as a section inside another card instead of a standalone panel. */
  embedded?: boolean;
}

type SortMode = 'name' | 'coverage';

export default function CoverageSummary({ nightMode = false, embedded = false }: CoverageSummaryProps) {
  const [sortMode, setSortMode] = useState<SortMode>('coverage');
  const [showHeatmap, setShowHeatmap] = useState(!embedded);

  const genomes = getGenomeData();
  const total = genomes.length;

  // Keyed on the cached array, not on its length: two datasets of the same size
  // would have reused the first one's coverage numbers.
  const coverage = useMemo(() => getDataTypeCoverage(), [genomes]);

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

  const header = embedded ? (
    <div className="mb-4">
      <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>Data Coverage</h3>
      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
        Assay completeness across {total.toLocaleString()} samples
      </p>
    </div>
  ) : (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
        <DocumentChartBarIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Data Coverage</h2>
        <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Assay completeness across {total.toLocaleString()} samples
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={
        embedded ? '' : `${card} rounded-2xl shadow-fancy border p-6 mb-6 transition-colors duration-300`
      }
    >
      {header}

      {/* Completion bars */}
      <div className="space-y-2.5 mb-6">
        {DATA_TYPES.map((type) => {
          const count = coverage[type] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const meta = dataTypeToken(type);
          return (
            <div key={type} className="flex items-center gap-3">
              <div className={`${embedded ? 'w-32 text-xs' : 'w-40 text-sm'} flex-shrink-0 font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {meta.label}
              </div>
              <div className={`flex-1 h-6 rounded-md overflow-hidden ${nightMode ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: meta.hex }}
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

      {/* Heatmap header + sort toggle. Collapsed by default when embedded —
          the availability matrix further down the page covers the same ground
          in more detail, so the panel stays short unless asked. */}
      <div className="flex items-center justify-between mb-2 gap-2">
        {embedded ? (
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
              nightMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${showHeatmap ? 'rotate-90' : ''}`} />
            Per-sample heatmap
          </button>
        ) : (
          <h3 className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>Per-sample heatmap</h3>
        )}
        {showHeatmap && (
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
        )}
      </div>

      {showHeatmap && (
      <>
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
              title={dataTypeToken(type).label}
              className={`px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wide ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {dataTypeToken(type).short}
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
                const meta = dataTypeToken(type);
                return (
                  <div key={type} className="px-1 py-1 flex justify-center">
                    <div
                      className="w-full h-5 rounded"
                      title={
                        size > 0
                          ? `${row.id} · ${meta.label}: available`
                          : `${row.id} · ${meta.label}: not available`
                      }
                      style={{ backgroundColor: size > 0 ? meta.hex : emptyCell }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend. Filled cells are coloured by assay, so the "available" swatch
          shows the actual column colours rather than a stand-in grey. */}
      <div className={`mt-3 flex flex-wrap items-center gap-4 text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            {DATA_TYPES.map((type) => (
              <span
                key={type}
                className="w-2 h-4 rounded-[2px]"
                style={{ backgroundColor: dataTypeToken(type).hex }}
              />
            ))}
          </span>
          Available (coloured by assay)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: emptyCell }} /> Not available
        </span>
      </div>
      </>
      )}
    </div>
  );
}
