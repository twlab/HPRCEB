import { useState, useMemo, useRef, useEffect } from 'react';
import { getGenomeData, getTrackData, getSampleDataAvailability, DATA_TYPES } from '../utils/genomeDataService';
import type { TrackEntry, DataType, Coordinate } from '../utils/genomeDataService';
import type { Genome } from '../utils/genomeTypes';
import CohortOverview from './CohortOverview';
import PopulationDataMap from './PopulationDataMap';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  coordinateBadge,
  dataTypeChip,
  dataTypeLabel,
  dataTypeToken,
  superPopBadge,
} from '../utils/theme';

interface DataAvailabilityMatrixProps {
  nightMode?: boolean;
}

type MetaColumnKey = 'population' | 'super_population' | 'sex';
type SortColumn = 'sample' | MetaColumnKey | DataType;
type SortDirection = 'asc' | 'desc';

// Sample metadata columns shown alongside the data-availability matrix
const META_COLUMNS: { key: MetaColumnKey; label: string; get: (g?: Genome) => string }[] = [
  { key: 'population', label: 'Population', get: (g) => g?.population_abbreviation || '' },
  { key: 'super_population', label: 'Super Pop.', get: (g) => (g?.super_population || '').toUpperCase() },
  { key: 'sex', label: 'Sex', get: (g) => g?.sex || '' },
];

// Column headers have to fit a narrow cell, so the matrix uses the short form
// of the shared label rather than the full one.
const DATA_TYPE_COLUMN_LABELS: Record<DataType, string> = {
  assembly: 'Genome Align',
  repeatmasker: 'RepeatMasker',
  methylation: 'Methylation',
  expression: 'Expression',
  chromatin_accessibility: 'Chromatin Acc.',
  chromatin_conformation: 'Chromatin Conf.',
};

const ALL_DATA_TYPE_KEYS = [
  'assembly',
  'repeatmasker',
  'methylation',
  'expression',
  'chromatin_accessibility',
  'chromatin_conformation',
  'annotation',
] as const;

function formatBytes(bytes: string): string {
  const n = parseInt(bytes, 10);
  if (!n || isNaN(n)) return '—';
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

// Map the browser track `type` to a human-readable format label
const FORMAT_LABELS: Record<string, string> = {
  bigwig: 'bigWig',
  hic: 'Hi-C',
  genomealign: 'Genome Align',
  refbed: 'refBed',
  repeatmasker: 'RepeatMasker',
  categorical: 'Categorical',
  modbed: 'modBED',
  methylc: 'methylC',
};
function formatLabel(type: string): string {
  return FORMAT_LABELS[type] ?? type;
}

function downloadTracksTSV(tracks: TrackEntry[], filename: string) {
  const headers = ['sample_id', 'data_type', 'coordinate', 'file_format', 'platform', 'processing_tool', 'track_name', 'url', 'size_bytes'];
  const rows = tracks.map((t) => [
    t.sample_id,
    t.data_type,
    t.browser_attributes?.coordinate ?? '',
    t.data_attributes?.file_format ?? '',
    t.data_attributes?.platform ?? '',
    t.data_attributes?.processing_tool ?? '',
    t.browser_attributes?.name ?? '',
    t.browser_attributes?.url ?? '',
    t.size_bytes,
  ]);
  const tsv = [headers, ...rows].map((r) => r.join('\t')).join('\n');
  const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type SelectionKind = 'sample' | 'type';
interface Selection { kind: SelectionKind; value: string }

const PAGE_SIZE = 50;

interface TrackExplorerProps {
  nightMode: boolean;
  trackData: Record<string, TrackEntry[]>;
  sampleIds: string[];
}

function TrackExplorer({ nightMode, trackData, sampleIds }: TrackExplorerProps) {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nm = nightMode;

  const allTracks = useMemo(() => {
    const all: TrackEntry[] = [];
    for (const tracks of Object.values(trackData)) {
      all.push(...tracks);
    }
    return all;
  }, [trackData]);

  const dataTypesInData = useMemo(() => {
    const s = new Set<string>();
    for (const t of allTracks) s.add(t.data_type);
    return ALL_DATA_TYPE_KEYS.filter((k) => s.has(k));
  }, [allTracks]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return { samples: [] as string[], types: [] as string[] };
    const q = query.toLowerCase();
    const samples = sampleIds.filter((id) => id.toLowerCase().includes(q)).slice(0, 8);
    const types = dataTypesInData.filter(
      (dt) => dt.toLowerCase().includes(q) || dataTypeLabel(dt).toLowerCase().includes(q)
    );
    return { samples, types };
  }, [query, sampleIds, dataTypesInData]);

  const hasSuggestions = suggestions.samples.length > 0 || suggestions.types.length > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (sel: Selection) => {
    setSelection(sel);
    setQuery(sel.kind === 'sample' ? sel.value : dataTypeLabel(sel.value));
    setOpen(false);
    setPage(0);
  };

  const handleInputChange = (v: string) => {
    setQuery(v);
    setSelection(null);
    setOpen(true);
    setPage(0);
  };

  const handleClear = () => {
    setQuery('');
    setSelection(null);
    setOpen(false);
    setPage(0);
  };

  const filteredTracks = useMemo(() => {
    if (!selection) return [];
    if (selection.kind === 'sample') return trackData[selection.value] ?? [];
    return allTracks.filter((t) => t.data_type === selection.value);
  }, [selection, trackData, allTracks]);

  const totalPages = Math.ceil(filteredTracks.length / PAGE_SIZE);
  const pagedTracks = filteredTracks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const uniqueSamplesInResult = useMemo(() => {
    if (!selection || selection.kind === 'sample') return 0;
    return new Set(filteredTracks.map((t) => t.sample_id)).size;
  }, [selection, filteredTracks]);

  const selLabel = selection
    ? selection.kind === 'sample'
      ? selection.value
      : dataTypeLabel(selection.value)
    : '';
  const downloadName = selection
    ? selection.kind === 'sample'
      ? `${selection.value}_tracks.tsv`
      : `${selection.value}_all_tracks.tsv`
    : 'all_tracks.tsv';

  const card = nm ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-100';
  const inputCls = nm
    ? 'bg-gray-700/80 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-primary-400 focus:ring-primary-400/20'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500/20';
  const ddBg = nm ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
  const ddItem = nm ? 'hover:bg-gray-600 text-gray-100' : 'hover:bg-primary-50 text-gray-800';
  const ddHead = nm ? 'text-gray-400 bg-gray-800' : 'text-gray-400 bg-gray-50';
  const thCls = nm ? 'bg-gray-900/80 text-gray-400' : 'bg-gray-50 text-gray-500';
  const trHover = nm ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50/80';

  return (
    <div className={`${card} rounded-2xl shadow-fancy border p-6 mb-6 transition-colors duration-300`}>
      {/* Header row. No section emblem and no per-assay glyphs anywhere below:
          the panel identifies its rows by name and colour alone. */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div>
          <h2 className={`text-base font-bold ${nm ? 'text-gray-100' : 'text-gray-900'}`}>Track Explorer</h2>
          <p className={`text-xs ${nm ? 'text-gray-400' : 'text-gray-500'}`}>Search by sample ID or data type to browse tracks</p>
        </div>

        {/* Download all button */}
        <button
          onClick={() => downloadTracksTSV(allTracks, 'all_tracks.tsv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${nm
            ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm hover:shadow'}`}
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Download Full Track List ({allTracks.length.toLocaleString()} tracks)
        </button>
      </div>

      {/* Quick-filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {dataTypesInData.map((dt) => {
          const active = selection?.kind === 'type' && selection.value === dt;
          return (
            <button
              key={dt}
              onClick={() => active ? handleClear() : handleSelect({ kind: 'type', value: dt })}
              aria-pressed={active}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${dataTypeChip(dt, nm, active)}`}
            >
              {dataTypeLabel(dt)}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative mb-5" ref={dropdownRef}>
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${nm ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            placeholder="Type a sample ID or data type…"
            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 ${inputCls}`}
          />
          {query && (
            <button
              onClick={handleClear}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors ${nm ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query && (hasSuggestions ? (
          <div className={`absolute z-30 mt-1.5 w-full rounded-xl border shadow-xl overflow-hidden ${ddBg}`}>
            {suggestions.types.length > 0 && (
              <>
                <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${ddHead}`}>Data Types</div>
                {suggestions.types.map((dt) => (
                  <button
                    key={dt}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${ddItem}`}
                    onMouseDown={() => handleSelect({ kind: 'type', value: dt })}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dataTypeToken(dt).hex }}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{dataTypeLabel(dt)}</span>
                    <span className={`text-xs ml-auto ${nm ? 'text-gray-400' : 'text-gray-400'}`}>{dt}</span>
                  </button>
                ))}
              </>
            )}
            {suggestions.samples.length > 0 && (
              <>
                <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${ddHead} ${suggestions.types.length > 0 ? 'border-t ' + (nm ? 'border-gray-600' : 'border-gray-100') : ''}`}>Samples</div>
                {suggestions.samples.map((id) => (
                  <button
                    key={id}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${ddItem}`}
                    onMouseDown={() => handleSelect({ kind: 'sample', value: id })}
                  >
                    <span className="font-medium">{id}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className={`absolute z-30 mt-1.5 w-full rounded-xl border shadow-xl px-4 py-3 text-sm ${nm ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
            No samples or data types match "<strong>{query}</strong>"
          </div>
        ))}
      </div>

      {/* Results area */}
      {selection ? (
        <>
          {/* Result header bar */}
          <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4 ${nm ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                selection.kind === 'sample'
                  ? nm ? 'bg-primary-800/50 text-primary-300' : 'bg-primary-100 text-primary-700'
                  : dataTypeChip(selection.value, nm)
              }`}>
                {selection.kind}
              </span>
              <span className={`text-sm font-semibold ${nm ? 'text-gray-100' : 'text-gray-800'}`}>{selLabel}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${nm ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                {filteredTracks.length.toLocaleString()} track{filteredTracks.length !== 1 ? 's' : ''}
              </span>
              {selection.kind === 'type' && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${nm ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  {uniqueSamplesInResult} sample{uniqueSamplesInResult !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {filteredTracks.length > 0 && (
              <button
                onClick={() => downloadTracksTSV(filteredTracks, downloadName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${nm
                  ? 'bg-primary-700/50 hover:bg-primary-600/60 text-primary-200'
                  : 'bg-primary-50 hover:bg-primary-100 text-primary-700'}`}
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Download TSV
              </button>
            )}
          </div>

          {/* Table */}
          {filteredTracks.length === 0 ? (
            <p className={`text-sm text-center py-8 ${nm ? 'text-gray-500' : 'text-gray-400'}`}>No tracks found.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: nm ? '#374151' : '#e5e7eb' }}>
                <table className={`min-w-full text-xs divide-y ${nm ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={thCls}>
                    <tr>
                      {(selection.kind === 'type'
                        ? ['Sample', 'Track Name', 'Coordinate', 'Format', 'Description', 'Size', 'URL']
                        : ['Data Type', 'Track Name', 'Coordinate', 'Format', 'Description', 'Size', 'URL']
                      ).map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${nm ? 'bg-gray-800 divide-gray-700/60' : 'bg-white divide-gray-100'} divide-y`}>
                    {pagedTracks.map((t, i) => {
                      return (
                        <tr key={i} className={`${trHover} transition-colors`}>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {selection.kind === 'type' ? (
                              <span className={`font-semibold ${nm ? 'text-gray-100' : 'text-gray-800'}`}>{t.sample_id}</span>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${dataTypeChip(t.data_type, nm)}`}>
                                {dataTypeLabel(t.data_type)}
                              </span>
                            )}
                          </td>
                          <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${nm ? 'text-gray-100' : 'text-gray-900'}`}>
                            {t.browser_attributes?.name ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {t.browser_attributes?.coordinate ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordinateBadge(t.browser_attributes.coordinate, nm)}`}>
                                {t.browser_attributes.coordinate}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {t.browser_attributes?.type ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${nm ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                                {formatLabel(t.browser_attributes.type)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className={`px-3 py-2.5 max-w-[220px] truncate ${nm ? 'text-gray-300' : 'text-gray-600'}`} title={t.data_attributes?.description ?? ''}>{t.data_attributes?.description || '—'}</td>
                          <td className={`px-3 py-2.5 whitespace-nowrap ${nm ? 'text-gray-300' : 'text-gray-600'}`}>{formatBytes(t.size_bytes)}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap max-w-[200px] truncate">
                            {t.browser_attributes?.url ? (
                              <a
                                href={t.browser_attributes.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`underline underline-offset-2 ${nm ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-800'}`}
                                title={t.browser_attributes.url}
                              >
                                {t.browser_attributes.url.split('/').pop()}
                              </a>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-xs ${nm ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing {(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, filteredTracks.length).toLocaleString()} of {filteredTracks.length.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page === 0
                        ? nm ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                        : nm ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p: number;
                      if (totalPages <= 5) p = i;
                      else if (page < 3) p = i;
                      else if (page > totalPages - 4) p = totalPages - 5 + i;
                      else p = page - 2 + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page
                            ? nm ? 'bg-primary-700 text-white' : 'bg-primary-600 text-white'
                            : nm ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {p + 1}
                        </button>
                      );
                    })}
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page >= totalPages - 1
                        ? nm ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                        : nm ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className={`flex flex-col items-center justify-center py-10 text-sm ${nm ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="font-medium mb-1">Search or click a data type above</p>
          <p className={`text-xs ${nm ? 'text-gray-600' : 'text-gray-400'}`}>Browse tracks by sample ID or filter by data type</p>
        </div>
      )}
    </div>
  );
}

export default function DataAvailabilityMatrix({ nightMode = false }: DataAvailabilityMatrixProps) {
  const genomeData = getGenomeData();
  const trackData = getTrackData();

  // `genomeData.map(...)` inline produced a new array on every render, so the
  // memo below never hit and every keystroke in the Track Explorer rebuilt the
  // availability of all ~230 samples. The cached arrays themselves are stable.
  const sampleIds = useMemo(() => genomeData.map((g) => g.id), [genomeData]);

  const genomeById = useMemo(
    () => new Map(genomeData.map((g) => [g.id, g])),
    [genomeData]
  );

  const [sortColumn, setSortColumn] = useState<SortColumn>('sample');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sampleAvailability = useMemo(
    () => sampleIds.map((sampleId) => ({
      sampleId,
      availability: getSampleDataAvailability(sampleId),
    })),
    [sampleIds, trackData]
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    const metaColumn = META_COLUMNS.find((m) => m.key === sortColumn);

    return [...sampleAvailability].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortColumn === 'sample') {
        aValue = a.sampleId;
        bValue = b.sampleId;
      } else if (metaColumn) {
        aValue = metaColumn.get(genomeById.get(a.sampleId));
        bValue = metaColumn.get(genomeById.get(b.sampleId));
      } else {
        aValue = a.availability[sortColumn as DataType].size;
        bValue = b.availability[sortColumn as DataType].size;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [sampleAvailability, genomeById, sortColumn, sortDirection]);

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <ArrowsUpDownIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-primary-600" />
    );
  };

  const renderAvailabilityCell = (coords: Set<Coordinate>) => {
    if (coords.size === 0) {
      return (
        <span className={nightMode ? 'text-gray-600' : 'text-gray-300'} title="Not available">
          ✗
        </span>
      );
    }

    const sortedCoords: Coordinate[] = ['hg38', 'chm13', 'DSA'].filter((c) =>
      coords.has(c as Coordinate)
    ) as Coordinate[];

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {sortedCoords.map((coord) => (
          <span
            key={coord}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordinateBadge(coord, nightMode)}`}
          >
            {coord}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <PopulationDataMap nightMode={nightMode} />
      </div>

      <TrackExplorer nightMode={nightMode} trackData={trackData} sampleIds={sampleIds} />

      <CohortOverview nightMode={nightMode} />

      <div
        className={`${
          nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}
      >
      {/* Instructions */}
      <div
        className={`mb-4 p-4 ${
          nightMode ? 'bg-primary-900/30 border-primary-600' : 'bg-primary-50 border-primary-400'
        } border-l-4 rounded-r-lg`}
      >
        <div className="flex items-start">
          <InformationCircleIcon
            className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'} mt-0.5 mr-2 flex-shrink-0`}
          />
          <div>
            <p className={`text-sm ${nightMode ? 'text-primary-200' : 'text-primary-900'}`}>
              <strong>How to read this table:</strong> Each row shows a genome sample and its available data types by
              coordinate system.{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordinateBadge('hg38', nightMode)} mx-1`}
              >
                hg38
              </span>{' '}
              and{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordinateBadge('chm13', nightMode)} mx-1`}
              >
                chm13
              </span>{' '}
              are reference genome coordinates, while{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordinateBadge('DSA', nightMode)} mx-1`}
              >
                DSA
              </span>{' '}
              indicates Diploid Donor-Specific Assembly coordinates. A{' '}
              <span className={`${nightMode ? 'text-gray-500' : 'text-gray-400'} mx-1`}>✗</span> means data is not
              available.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {sampleIds.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No data available</p>
        ) : (
          <table className={`min-w-full divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'} text-sm`}>
            <thead className={nightMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${
                    nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                  } uppercase cursor-pointer transition-colors group`}
                  onClick={() => handleSort('sample')}
                >
                  <div className="flex items-center gap-2">
                    Sample
                    {renderSortIcon('sample')}
                  </div>
                </th>
                {META_COLUMNS.map((meta) => (
                  <th
                    key={meta.key}
                    className={`px-4 py-3 text-left text-xs font-medium ${
                      nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                    } uppercase cursor-pointer transition-colors group`}
                    onClick={() => handleSort(meta.key)}
                  >
                    <div className="flex items-center gap-2">
                      {meta.label}
                      {renderSortIcon(meta.key)}
                    </div>
                  </th>
                ))}
                {DATA_TYPES.map((dataType) => (
                  <th
                    key={dataType}
                    className={`px-4 py-3 text-center text-xs font-medium ${
                      nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                    } uppercase cursor-pointer transition-colors group`}
                    onClick={() => handleSort(dataType)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {DATA_TYPE_COLUMN_LABELS[dataType]}
                      {renderSortIcon(dataType)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`${nightMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {sortedData.map(({ sampleId, availability }) => (
                <tr key={sampleId} className={nightMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-3 font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {sampleId}
                  </td>
                  {META_COLUMNS.map((meta) => {
                    const value = meta.get(genomeById.get(sampleId));
                    if (meta.key === 'super_population' && value) {
                      return (
                        <td key={meta.key} className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${superPopBadge(value, nightMode)}`}>
                            {value}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={meta.key} className={`px-4 py-3 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {value || <span className={nightMode ? 'text-gray-600' : 'text-gray-300'}>—</span>}
                      </td>
                    );
                  })}
                  {DATA_TYPES.map((dataType) => (
                    <td key={dataType} className="px-4 py-3 text-center">
                      {renderAvailabilityCell(availability[dataType])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
}
