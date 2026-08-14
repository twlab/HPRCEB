import { useState } from 'react';
import { createPortal } from 'react-dom';
import { DocumentChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import StepBadge, { stepBorder } from './StepBadge';
import { getGenomeData, hasDataType, getSampleDataSize } from '../utils/genomeDataService';
import type { DataLayer, Genome } from '../utils/genomeTypes';
import { DATA_TYPES, dataTypeBadge } from '../utils/theme';

/** The functional layers, in the order the picker offers them. */
const LAYER_ORDER: DataLayer[] = [
  'methylation',
  'expression',
  'chromatin_accessibility',
  'chromatin_conformation',
];

interface DataVisualizationProps {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  nightMode?: boolean;
  onReorderGenomes?: (newOrder: string[]) => void;
  onRemoveGenome?: (genomeId: string) => void;
  needsAttention?: boolean;
}

export default function DataVisualization({ selectedGenomes, selectedLayers, nightMode = false, onReorderGenomes, onRemoveGenome, needsAttention = false }: DataVisualizationProps) {
  const [selectedGenomeForDetails, setSelectedGenomeForDetails] = useState<Genome | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const canReorder = !!onReorderGenomes;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...selectedGenomes];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    onReorderGenomes?.(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const genomeData = getGenomeData();
  const isEmpty = selectedGenomes.length === 0;

  const renderTableRows = () => {
    return selectedGenomes.map((genomeId, index) => {
      const genome = genomeData.find((g) => g.id === genomeId);
      if (!genome) return null;

      const layers = LAYER_ORDER.filter(
        (layer) => selectedLayers.includes(layer) && hasDataType(genomeId, layer)
      ).map((layer) => (
        <span key={layer} className={`px-2 py-1 text-xs rounded ${dataTypeBadge(layer, nightMode)}`}>
          {DATA_TYPES[layer].label}
        </span>
      ));

      return (
        <tr
          key={genomeId}
          draggable={canReorder}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`${canReorder ? 'cursor-move' : ''} transition-colors ${
            dragIndex === index ? 'opacity-40' : ''
          } ${
            dragOverIndex === index && dragIndex !== index
              ? nightMode ? 'bg-gray-700' : 'bg-gray-100'
              : ''
          }`}
        >
          {canReorder && (
            <td className={`pl-4 pr-1 py-2.5 whitespace-nowrap text-center ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <span className="cursor-move select-none" title="Drag to reorder">⋮⋮</span>
            </td>
          )}
          <td className={`px-6 py-2.5 whitespace-nowrap text-sm font-medium ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{genome.id}</td>
          <td className={`px-6 py-2.5 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {genome.population_abbreviation && genome.super_population 
              ? `${genome.population_abbreviation} / ${genome.super_population}`
              : genome.population_abbreviation || genome.super_population || 'N/A'}
          </td>
          <td className={`px-6 py-2.5 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <div className="flex gap-1 flex-wrap">
              {layers.length > 0 ? layers : <span className={`text-xs italic ${nightMode ? 'text-gray-400' : 'text-gray-400'}`}>No layers selected</span>}
            </div>
          </td>
          <td className={`px-6 py-2.5 whitespace-nowrap text-sm ${nightMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <button
              onClick={() => setSelectedGenomeForDetails(genome)}
              className="text-primary-600 hover:text-primary-900 font-medium transition-colors"
            >
              Details
            </button>
          </td>
          {onRemoveGenome && (
            <td className="px-4 py-2.5 whitespace-nowrap text-center">
              <button
                onClick={() => onRemoveGenome(genomeId)}
                aria-label={`Remove ${genome.id}`}
                title={`Remove ${genome.id}`}
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                  nightMode
                    ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} ${stepBorder(nightMode, needsAttention)} rounded-2xl shadow-fancy border p-5 hover-lift transition-all duration-300 min-h-[360px]`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StepBadge step={4} needsAttention={needsAttention} nightMode={nightMode} />
          <h2 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Data Overview</h2>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="py-8 text-center">
          <DocumentChartBarIcon className={`mx-auto h-10 w-10 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h3 className={`mt-2 text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>No samples selected</h3>
          <p className={`mt-1 text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>Select samples to view information</p>
        </div>
      )}

      {/* Table View */}
      {!isEmpty && (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={nightMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                {canReorder && <th className={`pl-4 pr-1 py-2 w-8 ${nightMode ? 'bg-gray-900' : 'bg-gray-50'}`}><span className="sr-only">Reorder</span></th>}
                <th className={`px-6 py-2 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Genome ID</th>
                <th className={`px-6 py-2 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Population</th>
                <th className={`px-6 py-2 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Data Layers</th>
                <th className={`px-6 py-2 text-left text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                {onRemoveGenome && <th className={`px-4 py-2 w-8 ${nightMode ? 'bg-gray-900' : 'bg-gray-50'}`}><span className="sr-only">Remove</span></th>}
              </tr>
            </thead>
            <tbody className={`${nightMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
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
                <XMarkIcon className="w-6 h-6" />
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
                  {selectedGenomeForDetails.sex && (
                    <div>
                      <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} font-semibold uppercase`}>Sex</p>
                      <p className={`text-sm capitalize ${nightMode ? 'text-gray-200' : 'text-gray-900'} mt-1`}>{selectedGenomeForDetails.sex}</p>
                    </div>
                  )}
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
                  {LAYER_ORDER.filter((layer) => hasDataType(selectedGenomeForDetails.id, layer)).map((layer) => (
                    <div
                      key={layer}
                      className={`flex items-center gap-3 p-3 rounded-lg ${nightMode ? 'bg-gray-700/50' : DATA_TYPES[layer].panel}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: DATA_TYPES[layer].hex }}
                        aria-hidden="true"
                      />
                      <span className={`font-medium ${nightMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {DATA_TYPES[layer].label}
                      </span>
                      <span className={`ml-auto text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getSampleDataSize(selectedGenomeForDetails.id, [layer]).toFixed(1)} GB
                      </span>
                    </div>
                  ))}
                  {LAYER_ORDER.every((layer) => !hasDataType(selectedGenomeForDetails.id, layer)) && (
                    <p className={`text-sm italic ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No functional data layers available for this sample.
                    </p>
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
