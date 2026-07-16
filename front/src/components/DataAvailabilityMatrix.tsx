import { useState, useMemo, useRef, useEffect } from 'react';
import { getGenomeData, getTrackData, getSampleDataAvailability, DATA_TYPES } from '../utils/genomeDataService';
import type { TrackEntry, DataType, Coordinate } from '../utils/genomeDataService';
import CoverageSummary from './CoverageSummary';
import PopulationComposition from './PopulationComposition';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  CubeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  LockOpenIcon,
  CubeTransparentIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

interface DataAvailabilityMatrixProps {
  nightMode?: boolean;
}

type SortColumn = 'sample' | DataType;
type SortDirection = 'asc' | 'desc';

interface SampleAvailability {
  sampleId: string;
  availability: Record<DataType, Set<Coordinate>>;
}

const DATA_TYPE_LABELS: Record<DataType, string> = {
  assembly: 'Genome Align',
  repeatmasker: 'RepeatMasker',
  methylation: 'Methylation',
  expression: 'Expression',
  chromatin_accessibility: 'Chromatin Acc.',
  chromatin_conformation: 'Chromatin Conf.',
};

const COORDINATE_COLORS: Record<Coordinate, { bg: string; text: string }> = {
  hg38: { bg: 'bg-blue-100', text: 'text-blue-800' },
  chm13: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  DSA: { bg: 'bg-amber-100', text: 'text-amber-800' },
};


const ALL_DATA_TYPE_KEYS = ['assembly', 'repeatmasker', 'methylation', 'expression', 'chromatin_accessibility', 'chromatin_conformation', 'annotation'] as const;

const DATA_TYPE_LABELS_FULL: Record<string, string> = {
  assembly: 'Genome Alignment',
  repeatmasker: 'RepeatMasker',
  methylation: 'Methylation',
  expression: 'Expression',
  chromatin_accessibility: 'Chromatin Accessibility',
  chromatin_conformation: 'Chromatin Conformation',
  annotation: 'Annotation',
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const DATA_TYPE_ICONS: Record<string, IconComponent> = {
  assembly: CubeIcon,
  repeatmasker: ArrowPathIcon,
  methylation: ShieldCheckIcon,
  expression: ArrowTrendingUpIcon,
  chromatin_accessibility: LockOpenIcon,
  chromatin_conformation: CubeTransparentIcon,
  annotation: TagIcon,
};

// Data types whose logo should not be rendered in the Track Explorer
const HIDDEN_ICON_DATA_TYPES = new Set(['methylation', 'expression', 'chromatin_accessibility']);
function DataTypeIcon({ dataType, className }: { dataType: string; className?: string }) {
  if (HIDDEN_ICON_DATA_TYPES.has(dataType)) return null;
  const Icon = DATA_TYPE_ICONS[dataType] ?? DATA_TYPE_ICONS.annotation;
  return <Icon className={className} />;
}

const DATA_TYPE_COLORS: Record<string, { chip: string; chipActive: string }> = {
  assembly:                 { chip: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',              chipActive: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' },
  repeatmasker:             { chip: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',          chipActive: 'bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-200' },
  methylation:              { chip: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',              chipActive: 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-200' },
  expression:               { chip: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',          chipActive: 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' },
  chromatin_accessibility:  { chip: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',      chipActive: 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200' },
  chromatin_conformation:   { chip: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',      chipActive: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200' },
  annotation:               { chip: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',              chipActive: 'bg-gray-600 text-white border-gray-600 shadow-md shadow-gray-200' },
};

const DATA_TYPE_COLORS_DARK: Record<string, { chip: string; chipActive: string }> = {
  assembly:                 { chip: 'bg-blue-900/30 text-blue-300 border-blue-700 hover:bg-blue-800/40',              chipActive: 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/50' },
  repeatmasker:             { chip: 'bg-slate-800/40 text-slate-300 border-slate-600 hover:bg-slate-700/40',          chipActive: 'bg-slate-500 text-white border-slate-400 shadow-md shadow-slate-900/50' },
  methylation:              { chip: 'bg-cyan-900/30 text-cyan-300 border-cyan-700 hover:bg-cyan-800/40',              chipActive: 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-900/50' },
  expression:               { chip: 'bg-green-900/30 text-green-300 border-green-700 hover:bg-green-800/40',          chipActive: 'bg-green-600 text-white border-green-500 shadow-md shadow-green-900/50' },
  chromatin_accessibility:  { chip: 'bg-orange-900/30 text-orange-300 border-orange-700 hover:bg-orange-800/40',      chipActive: 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-900/50' },
  chromatin_conformation:   { chip: 'bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-800/40',      chipActive: 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50' },
  annotation:               { chip: 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50',              chipActive: 'bg-gray-500 text-white border-gray-400 shadow-md shadow-gray-900/50' },
};

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
      (dt) => dt.toLowerCase().includes(q) || (DATA_TYPE_LABELS_FULL[dt] ?? '').toLowerCase().includes(q)
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
    setQuery(sel.kind === 'sample' ? sel.value : DATA_TYPE_LABELS_FULL[sel.value] ?? sel.value);
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
      : DATA_TYPE_LABELS_FULL[selection.value] ?? selection.value
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
  const ddHead = nm ? 'text-gray-400 bg-gray-750' : 'text-gray-400 bg-gray-50';
  const thCls = nm ? 'bg-gray-900/80 text-gray-400' : 'bg-gray-50 text-gray-500';
  const trHover = nm ? 'hover:bg-gray-750' : 'hover:bg-gray-50/80';
  const coordBadge = (coord: string) => {
    if (coord === 'hg38') return nm ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800';
    if (coord === 'chm13' || coord === 't2t-chm13-v2.0') return nm ? 'bg-emerald-800/50 text-emerald-200' : 'bg-emerald-100 text-emerald-800';
    return nm ? 'bg-amber-800/50 text-amber-200' : 'bg-amber-100 text-amber-800';
  };

  return (
    <div className={`${card} rounded-2xl shadow-fancy border p-6 mb-6 transition-colors duration-300`}>
      {/* Header row */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${nm ? 'bg-gradient-to-br from-primary-800/60 to-primary-900/40 text-primary-300' : 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600'} shadow-sm`}>
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${nm ? 'text-gray-100' : 'text-gray-900'}`}>Track Explorer</h2>
            <p className={`text-xs ${nm ? 'text-gray-400' : 'text-gray-500'}`}>Search by sample ID or data type to browse tracks</p>
          </div>
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
          const colors = nm ? DATA_TYPE_COLORS_DARK[dt] : DATA_TYPE_COLORS[dt];
          return (
            <button
              key={dt}
              onClick={() => active ? handleClear() : handleSelect({ kind: 'type', value: dt })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${active ? colors.chipActive : colors.chip}`}
            >
              <DataTypeIcon dataType={dt} className="w-3.5 h-3.5" />
              {DATA_TYPE_LABELS_FULL[dt] ?? dt}
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
                    <DataTypeIcon dataType={dt} className="w-4 h-4 opacity-60" />
                    <span className="font-medium">{DATA_TYPE_LABELS_FULL[dt] ?? dt}</span>
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
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${ddItem}`}
                    onMouseDown={() => handleSelect({ kind: 'sample', value: id })}
                  >
                    <UserIcon className="w-4 h-4 opacity-60" />
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
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                selection.kind === 'sample'
                  ? nm ? 'bg-primary-800/50 text-primary-300' : 'bg-primary-100 text-primary-700'
                  : nm ? 'bg-violet-800/50 text-violet-300' : 'bg-violet-100 text-violet-700'
              }`}>
                {selection.kind === 'sample' ? (
                  <UserIcon className="w-3.5 h-3.5" />
                ) : (
                  <DataTypeIcon dataType={selection.value} className="w-3.5 h-3.5" />
                )}
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
                      const dtColors = nm ? DATA_TYPE_COLORS_DARK[t.data_type] : DATA_TYPE_COLORS[t.data_type];
                      return (
                        <tr key={i} className={`${trHover} transition-colors`}>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {selection.kind === 'type' ? (
                              <span className={`font-semibold ${nm ? 'text-gray-100' : 'text-gray-800'}`}>{t.sample_id}</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${dtColors?.chip ?? ''}`}>
                                <DataTypeIcon dataType={t.data_type} className="w-3 h-3" />
                                {DATA_TYPE_LABELS_FULL[t.data_type] ?? t.data_type}
                              </span>
                            )}
                          </td>
                          <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${nm ? 'text-gray-100' : 'text-gray-900'}`}>
                            {t.browser_attributes?.name ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {t.browser_attributes?.coordinate ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${coordBadge(t.browser_attributes.coordinate)}`}>
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
          <div className={`p-4 rounded-2xl mb-3 ${nm ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
            <ClipboardIcon className="w-10 h-10 opacity-40" />
          </div>
          <p className="font-medium mb-1">Search or click a data type above</p>
          <p className={`text-xs ${nm ? 'text-gray-600' : 'text-gray-300'}`}>Browse tracks by sample ID or filter by data type</p>
        </div>
      )}
    </div>
  );
}

export default function DataAvailabilityMatrix({ nightMode = false }: DataAvailabilityMatrixProps) {
  const genomeData = getGenomeData();
  const trackData = getTrackData();
  const sampleIds = genomeData.map((g) => g.id);

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

  const sortedData = [...sampleAvailability].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortColumn === 'sample') {
      aValue = a.sampleId;
      bValue = b.sampleId;
    } else {
      aValue = a.availability[sortColumn].size;
      bValue = b.availability[sortColumn].size;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

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
      return <span className="text-gray-300">✗</span>;
    }

    const sortedCoords: Coordinate[] = ['hg38', 'chm13', 'DSA'].filter((c) =>
      coords.has(c as Coordinate)
    ) as Coordinate[];

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {sortedCoords.map((coord) => (
          <span
            key={coord}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COORDINATE_COLORS[coord].bg} ${COORDINATE_COLORS[coord].text}`}
          >
            {coord}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <TrackExplorer nightMode={nightMode} trackData={trackData} sampleIds={sampleIds} />

      <CoverageSummary nightMode={nightMode} />

      <div className="mb-6">
        <PopulationComposition nightMode={nightMode} />
      </div>

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
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  nightMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800'
                } mx-1`}
              >
                hg38
              </span>{' '}
              and{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  nightMode ? 'bg-emerald-800/50 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                } mx-1`}
              >
                chm13
              </span>{' '}
              are reference genome coordinates, while{' '}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  nightMode ? 'bg-amber-800/50 text-amber-200' : 'bg-amber-100 text-amber-800'
                } mx-1`}
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
                {DATA_TYPES.map((dataType) => (
                  <th
                    key={dataType}
                    className={`px-4 py-3 text-center text-xs font-medium ${
                      nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                    } uppercase cursor-pointer transition-colors group`}
                    onClick={() => handleSort(dataType)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {DATA_TYPE_LABELS[dataType]}
                      {renderSortIcon(dataType)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`${nightMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {sortedData.map(({ sampleId, availability }) => (
                <tr key={sampleId} className={nightMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-3 font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {sampleId}
                  </td>
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
