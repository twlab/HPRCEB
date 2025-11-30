import { useState, useMemo } from 'react';
import { getGenomeData, getTrackData } from '../utils/genomeDataService';
import type { TrackEntry } from '../utils/genomeDataService';

interface DataAvailabilityMatrixProps {
  nightMode?: boolean;
}

type DataType = 'assembly' | 'repeatmasker' | 'methylation' | 'expression' | 'chromatin_accessibility' | 'chromatin_conformation';
type Coordinate = 'hg38' | 'chm13' | 'DSA';
type SortColumn = 'sample' | DataType;
type SortDirection = 'asc' | 'desc';

interface SampleAvailability {
  sampleId: string;
  availability: Record<DataType, Set<Coordinate>>;
}

const DATA_TYPES: DataType[] = ['assembly', 'repeatmasker', 'methylation', 'expression', 'chromatin_accessibility', 'chromatin_conformation'];

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

function normalizeCoordinate(coord: string): Coordinate {
  if (coord === 'hg38') return 'hg38';
  if (coord === 'chm13' || coord === 't2t-chm13-v2.0') return 'chm13';
  return 'DSA';
}

function computeSampleAvailability(
  sampleIds: string[],
  trackData: Record<string, TrackEntry[]>
): SampleAvailability[] {
  return sampleIds.map((sampleId) => {
    const tracks = trackData[sampleId] || [];
    const availability: Record<DataType, Set<Coordinate>> = {
      assembly: new Set(),
      repeatmasker: new Set(),
      methylation: new Set(),
      expression: new Set(),
      chromatin_accessibility: new Set(),
      chromatin_conformation: new Set(),
    };

    for (const track of tracks) {
      const dataType = track.data_type as DataType;
      if (!DATA_TYPES.includes(dataType)) continue;

      const coord = track.browser_attributes?.coordinate;
      if (!coord) continue;

      const normalizedCoord = normalizeCoordinate(coord);
      availability[dataType].add(normalizedCoord);
    }

    return { sampleId, availability };
  });
}

export default function DataAvailabilityMatrix({ nightMode = false }: DataAvailabilityMatrixProps) {
  const genomeData = getGenomeData();
  const trackData = getTrackData();
  const sampleIds = genomeData.map((g) => g.id);

  const [sortColumn, setSortColumn] = useState<SortColumn>('sample');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sampleAvailability = useMemo(
    () => computeSampleAvailability(sampleIds, trackData),
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
        <svg
          className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
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
          <svg
            className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'} mt-0.5 mr-2 flex-shrink-0`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
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
  );
}
