import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getGenomeData, hasDataType, getSampleDataSize } from '../utils/genomeDataService';
import { createDataChart } from '../utils/chartUtils';
import type { DataLayer, Genome } from '../utils/genomeTypes';
import { POPULATION_MAP } from '../utils/constants';

interface DataVisualizationProps {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  nightMode?: boolean;
}

export default function DataVisualization({ selectedGenomes, selectedLayers, nightMode = false }: DataVisualizationProps) {
  const [currentView, setCurrentView] = useState<'table' | 'chart'>('table');
  const [selectedGenomeForDetails, setSelectedGenomeForDetails] = useState<Genome | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  const genomeData = getGenomeData();
  const isEmpty = selectedGenomes.length === 0 || selectedLayers.length === 0;

  useEffect(() => {
    if (!isEmpty && currentView === 'chart' && chartCanvasRef.current) {
      createDataChart(selectedGenomes, selectedLayers, chartCanvasRef.current);
    }
  }, [selectedGenomes, selectedLayers, currentView, isEmpty]);

  const renderTableRows = () => {
    return selectedGenomes.map((genomeId) => {
      const genome = genomeData.find((g) => g.id === genomeId);
      if (!genome) return null;

      const layers = [];
      if (selectedLayers.includes("methylation") && hasDataType(genomeId, 'methylation')) {
        layers.push(<span key="methylation" className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded">Methylation</span>);
      }
      if (selectedLayers.includes("expression") && hasDataType(genomeId, 'expression')) {
        layers.push(<span key="expression" className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Expression</span>);
      }
      if (selectedLayers.includes("chromatin_accessibility") && hasDataType(genomeId, 'chromatin_accessibility')) {
        layers.push(<span key="chromatin_accessibility" className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Chromatin Accessibility</span>);
      }
      if (selectedLayers.includes("chromatin_conformation") && hasDataType(genomeId, 'chromatin_conformation')) {
        layers.push(<span key="chromatin_conformation" className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Chromatin Conformation</span>);
      }

      const assemblySize = getSampleDataSize(genomeId, ['assembly']);

      return (
        <tr key={genomeId}>
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{genome.id}</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>{POPULATION_MAP[genome.population]}</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>{assemblySize.toFixed(1)} GB</td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <div className="flex gap-1 flex-wrap">{layers}</div>
          </td>
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <button 
              onClick={() => setSelectedGenomeForDetails(genome)}
              className="text-primary-600 hover:text-primary-900 font-medium transition-colors"
            >
              View Details
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-5 hover-lift transition-colors duration-300 min-h-[600px]`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2h2a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2z"></path>
            </svg>
          </div>
          <h2 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Data Overview</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('table')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
              currentView === 'table'
                ? nightMode 
                  ? 'text-gray-100 bg-gradient-to-r from-gray-700 to-gray-600'
                  : 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50'
                : nightMode
                  ? 'text-gray-300 bg-gray-800 border border-gray-600 hover:border-gray-500'
                  : 'text-gray-700 bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            📊 Table
          </button>
          <button 
            onClick={() => setCurrentView('chart')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
              currentView === 'chart'
                ? nightMode 
                  ? 'text-gray-100 bg-gradient-to-r from-gray-700 to-gray-600'
                  : 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50'
                : nightMode
                  ? 'text-gray-300 bg-gray-800 border border-gray-600 hover:border-gray-500'
                  : 'text-gray-700 bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            📈 Chart
          </button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="py-8 text-center">
          <svg className={`mx-auto h-10 w-10 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>No data selected</h3>
          <p className={`mt-1 text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Select genomes and data layers to view information</p>
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

      {/* Details Modal - Rendered via Portal */}
      {selectedGenomeForDetails && createPortal(
        <div 
          className="fixed inset-0 bg-gray-600/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGenomeForDetails(null)}
        >
          <div 
            className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between z-10`}>
              <h3 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Sample Detail: {selectedGenomeForDetails.id}
              </h3>
              <button
                onClick={() => setSelectedGenomeForDetails(null)}
                className={`${nightMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Section 1: Basic Information */}
              <div>
                <h4 className={`text-lg font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'} mb-3`}>Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Sample ID</p>
                    <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.id}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Population</p>
                    <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{POPULATION_MAP[selectedGenomeForDetails.population]}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Assembly Size</p>
                    <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{getSampleDataSize(selectedGenomeForDetails.id, ['assembly']).toFixed(1)} GB</p>
                  </div>
                  <div>
                    <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Quality</p>
                    <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.quality}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Contig N50</p>
                    <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.contigN50.toLocaleString()}</p>
                  </div>
                  {selectedGenomeForDetails.biosample_id && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Biosample ID</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.biosample_id}</p>
                    </div>
                  )}
                  {selectedGenomeForDetails.population_descriptor && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Population Descriptor</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.population_descriptor}</p>
                    </div>
                  )}
                  {selectedGenomeForDetails.population_abbreviation && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Population Abbreviation</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.population_abbreviation}</p>
                    </div>
                  )}
                  {selectedGenomeForDetails.super_population && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Super Population</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.super_population}</p>
                    </div>
                  )}
                  {selectedGenomeForDetails.longitude && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Longitude</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.longitude}</p>
                    </div>
                  )}
                  {selectedGenomeForDetails.latitude && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Latitude</p>
                      <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.latitude}</p>
                    </div>
                  )}
                  {/* Additional metadata fields (excluding family info) */}
                  {selectedGenomeForDetails.metadata && Object.entries(selectedGenomeForDetails.metadata).map(([key, value]) => {
                    // Skip family-related fields and empty values
                    const familyFields = ['family_id', 'paternal_id', 'maternal_id', 'trio_available'];
                    if (familyFields.includes(key) || !value || value === '' || value === 'NA' || value === 'N/A') {
                      return null;
                    }
                    return (
                      <div key={key}>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Family Information */}
              {(selectedGenomeForDetails.family_id || selectedGenomeForDetails.paternal_id || selectedGenomeForDetails.maternal_id) && (
                <div>
                  <h4 className={`text-lg font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'} mb-3`}>Family Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedGenomeForDetails.family_id && (
                      <div>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Family ID</p>
                        <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.family_id}</p>
                      </div>
                    )}
                    {selectedGenomeForDetails.paternal_id && (
                      <div>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Paternal ID</p>
                        <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.paternal_id}</p>
                      </div>
                    )}
                    {selectedGenomeForDetails.maternal_id && (
                      <div>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Maternal ID</p>
                        <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.maternal_id}</p>
                      </div>
                    )}
                    {selectedGenomeForDetails.trio_available !== undefined && (
                      <div>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Trio Available</p>
                        <p className={`text-sm ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>
                          {selectedGenomeForDetails.trio_available ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Available Data Layers */}
              <div>
                <h4 className={`text-lg font-bold ${nightMode ? 'text-gray-200' : 'text-gray-900'} mb-3`}>Available Data Layers</h4>
                <div className="space-y-2">
                  {hasDataType(selectedGenomeForDetails.id, 'methylation') && (
                    <div className={`flex items-center justify-between p-3 ${nightMode ? 'bg-gray-700/50' : 'bg-cyan-50'} rounded-lg`}>
                      <span className={`font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Methylation</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getSampleDataSize(selectedGenomeForDetails.id, ['methylation']).toFixed(1)} GB
                      </span>
                    </div>
                  )}
                  {hasDataType(selectedGenomeForDetails.id, 'expression') && (
                    <div className={`flex items-center justify-between p-3 ${nightMode ? 'bg-gray-700/50' : 'bg-green-50'} rounded-lg`}>
                      <span className={`font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Expression</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getSampleDataSize(selectedGenomeForDetails.id, ['expression']).toFixed(1)} GB
                      </span>
                    </div>
                  )}
                  {hasDataType(selectedGenomeForDetails.id, 'chromatin_accessibility') && (
                    <div className={`flex items-center justify-between p-3 ${nightMode ? 'bg-gray-700/50' : 'bg-orange-50'} rounded-lg`}>
                      <span className={`font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Chromatin Accessibility</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getSampleDataSize(selectedGenomeForDetails.id, ['chromatin_accessibility']).toFixed(1)} GB
                      </span>
                    </div>
                  )}
                  {hasDataType(selectedGenomeForDetails.id, 'chromatin_conformation') && (
                    <div className={`flex items-center justify-between p-3 ${nightMode ? 'bg-gray-700/50' : 'bg-purple-50'} rounded-lg`}>
                      <span className={`font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>Chromatin Conformation</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getSampleDataSize(selectedGenomeForDetails.id, ['chromatin_conformation']).toFixed(1)} GB
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t px-6 py-4`}>
              <button
                onClick={() => setSelectedGenomeForDetails(null)}
                className={`w-full px-4 py-2 ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-lg font-medium transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
