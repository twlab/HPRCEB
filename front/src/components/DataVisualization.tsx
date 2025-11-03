import { useState, useEffect, useRef } from 'react';
import { getGenomeData } from '../utils/genomeDataService';
import { createDataChart } from '../utils/chartUtils';
import type { DataLayer } from '../utils/genomeTypes';
import { POPULATION_MAP } from '../utils/constants';

interface DataVisualizationProps {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  nightMode?: boolean;
}

export default function DataVisualization({ selectedGenomes, selectedLayers, nightMode = false }: DataVisualizationProps) {
  const [currentView, setCurrentView] = useState<'table' | 'chart'>('table');
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  const genomeData = getGenomeData();
  const isEmpty = selectedGenomes.length === 0 || selectedLayers.length === 0;

  useEffect(() => {
    if (!isEmpty && currentView === 'chart' && chartCanvasRef.current) {
      createDataChart(selectedGenomes, genomeData, selectedLayers, chartCanvasRef.current);
    }
  }, [selectedGenomes, selectedLayers, currentView, isEmpty, genomeData]);

  const renderTableRows = () => {
    return selectedGenomes.map((genomeId) => {
      const genome = genomeData.find((g) => g.id === genomeId);
      if (!genome) return null;

      const layers = [];
      if (selectedLayers.includes("methylation") && genome.methylation) {
        layers.push(<span key="methylation" className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Methylation</span>);
      }
      if (selectedLayers.includes("expression") && genome.expression) {
        layers.push(<span key="expression" className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Expression</span>);
      }
      if (selectedLayers.includes("fiberseq") && genome.fiberseq) {
        layers.push(<span key="fiberseq" className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Fiber-seq</span>);
      }

      return (
        <tr key={genomeId}>
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{genome.id}</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>{POPULATION_MAP[genome.population]}</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>{genome.assemblySize} GB</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <div className="flex gap-1 flex-wrap">{layers}</div>
          </td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <button className="text-primary-600 hover:text-primary-900 font-medium">View Details</button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300 min-h-[750px]`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2h2a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2z"></path>
            </svg>
          </div>
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Data Overview</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('table')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              currentView === 'table'
                ? nightMode 
                  ? 'text-gray-100 bg-gradient-to-r from-gray-700 to-gray-600'
                  : 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50'
                : nightMode
                  ? 'text-gray-300 bg-gray-800 border-2 border-gray-600 hover:border-gray-500'
                  : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            📊 Table
          </button>
          <button 
            onClick={() => setCurrentView('chart')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              currentView === 'chart'
                ? nightMode 
                  ? 'text-gray-100 bg-gradient-to-r from-gray-700 to-gray-600'
                  : 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50'
                : nightMode
                  ? 'text-gray-300 bg-gray-800 border-2 border-gray-600 hover:border-gray-500'
                  : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            📈 Chart
          </button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="py-12 text-center">
          <svg className={`mx-auto h-12 w-12 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>No data selected</h3>
          <p className={`mt-1 text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Select genomes and data layers to view information</p>
        </div>
      )}

      {/* Table View */}
      {!isEmpty && currentView === 'table' && (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={nightMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Genome ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Population</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Assembly Size</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Data Layers</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${nightMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart View */}
      {!isEmpty && currentView === 'chart' && (
        <canvas ref={chartCanvasRef} className="w-full" height="300"></canvas>
      )}
    </div>
  );
}

