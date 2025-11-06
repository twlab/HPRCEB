import { useState } from 'react';
import type { Genome } from '../utils/genomeTypes';

interface AvailabilityMatrixTableProps {
  genomes: Genome[];
  onGenomeClick?: (genomeId: string) => void;
  nightMode?: boolean;
}

type SortColumn = 'sample' | 'assembly' | 'methylation' | 'expression' | 'fiberseq' | 'totalSize';
type SortDirection = 'asc' | 'desc';

export default function AvailabilityMatrixTable({ genomes, onGenomeClick, nightMode = false }: AvailabilityMatrixTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('sample');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!genomes || genomes.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No data available</p>;
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedGenomes = () => {
    const sorted = [...genomes].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'sample':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'assembly':
          aValue = (a.assemblyTracks?.length || (a.assemblyTrack ? 1 : 0));
          bValue = (b.assemblyTracks?.length || (b.assemblyTrack ? 1 : 0));
          break;
        case 'methylation':
          aValue = a.methylation ? 1 : 0;
          bValue = b.methylation ? 1 : 0;
          break;
        case 'expression':
          aValue = a.expression ? 1 : 0;
          bValue = b.expression ? 1 : 0;
          break;
        case 'fiberseq':
          aValue = a.fiberseq ? 1 : 0;
          bValue = b.fiberseq ? 1 : 0;
          break;
        case 'totalSize':
          aValue = a.assemblySize + (a.methylationSize || 0) + (a.expressionSize || 0) + (a.fiberseqSize || 0);
          bValue = b.assemblySize + (b.methylationSize || 0) + (b.expressionSize || 0) + (b.fiberseqSize || 0);
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const sortedGenomes = getSortedGenomes();

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    );
  };

  const renderAvailabilityCell = (genome: Genome, dataType: 'assembly' | 'methylation' | 'expression' | 'fiberseq') => {
    // Color mapping for each data type
    const colorMap = {
      assembly: { bg: 'bg-indigo-100', text: 'text-indigo-800', check: 'text-indigo-500' },
      methylation: { bg: 'bg-cyan-100', text: 'text-cyan-800', check: 'text-cyan-500' },
      expression: { bg: 'bg-green-100', text: 'text-green-800', check: 'text-green-500' },
      fiberseq: { bg: 'bg-orange-100', text: 'text-orange-800', check: 'text-orange-500' },
    };
    
    const colors = colorMap[dataType];
    
    if (dataType === 'assembly') {
      const tracks = genome.assemblyTracks || (genome.assemblyTrack ? [genome.assemblyTrack] : []);
      if (tracks.length === 0) return <span className="text-gray-300">✗</span>;
      
      const genomeTypes = tracks.map(t => t.genome || t.browser?.genome).filter(Boolean);
      return (
        <>
          {genomeTypes.map((g, i) => (
            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} mr-1`}>
              {g}
            </span>
          ))}
        </>
      );
    }
    
    if (!genome[dataType]) return <span className="text-gray-300">✗</span>;
    
    const tracks = genome[`${dataType}Tracks` as keyof Genome] as any[] | undefined;
    if (!tracks || tracks.length === 0) return <span className={colors.check}>✓</span>;
    
    const genomeTypes = tracks.map(t => t.genome || t.browser?.genome).filter(Boolean);
    const uniqueGenomes = [...new Set(genomeTypes)];
    
    if (uniqueGenomes.length === 0) return <span className={colors.check}>✓</span>;
    
    return (
      <>
        {uniqueGenomes.map((g, i) => (
          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} mr-1`}>
            {g}
          </span>
        ))}
      </>
    );
  };

  return (
    <table className={`min-w-full divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'} text-sm`}>
      <thead className={nightMode ? 'bg-gray-900' : 'bg-gray-50'}>
        <tr>
          <th 
            className={`px-4 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('sample')}
          >
            <div className="flex items-center gap-2">
              Sample
              {renderSortIcon('sample')}
            </div>
          </th>
          <th 
            className={`px-4 py-3 text-center text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('assembly')}
          >
            <div className="flex items-center justify-center gap-2">
              Assembly
              {renderSortIcon('assembly')}
            </div>
          </th>
          <th 
            className={`px-4 py-3 text-center text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('methylation')}
          >
            <div className="flex items-center justify-center gap-2">
              Methylation
              {renderSortIcon('methylation')}
            </div>
          </th>
          <th 
            className={`px-4 py-3 text-center text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('expression')}
          >
            <div className="flex items-center justify-center gap-2">
              Expression
              {renderSortIcon('expression')}
            </div>
          </th>
          <th 
            className={`px-4 py-3 text-center text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('fiberseq')}
          >
            <div className="flex items-center justify-center gap-2">
              Fiber-seq
              {renderSortIcon('fiberseq')}
            </div>
          </th>
          <th 
            className={`px-4 py-3 text-center text-xs font-medium ${nightMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} uppercase cursor-pointer transition-colors group`}
            onClick={() => handleSort('totalSize')}
          >
            <div className="flex items-center justify-center gap-2">
              Total Size
              {renderSortIcon('totalSize')}
            </div>
          </th>
        </tr>
      </thead>
      <tbody className={`${nightMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
        {sortedGenomes.map(genome => {
          const totalSize = genome.assemblySize + (genome.methylationSize || 0) + (genome.expressionSize || 0) + (genome.fiberseqSize || 0);
          return (
            <tr 
              key={genome.id}
              className={`${nightMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} cursor-pointer`}
              onClick={() => onGenomeClick?.(genome.id)}
            >
              <td className={`px-4 py-3 font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{genome.id}</td>
              <td className="px-4 py-3 text-center">{renderAvailabilityCell(genome, 'assembly')}</td>
              <td className="px-4 py-3 text-center">{renderAvailabilityCell(genome, 'methylation')}</td>
              <td className="px-4 py-3 text-center">{renderAvailabilityCell(genome, 'expression')}</td>
              <td className="px-4 py-3 text-center">{renderAvailabilityCell(genome, 'fiberseq')}</td>
              <td className={`px-4 py-3 text-center ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>{totalSize.toFixed(1)} GB</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

