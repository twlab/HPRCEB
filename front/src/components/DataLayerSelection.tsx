import { CheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import StepBadge, { stepBorder } from './StepBadge';
import { DATA_LAYER_INFO } from '../utils/constants';
import { DATA_TYPES, dataTypeBadge } from '../utils/theme';
import type { DataLayer } from '../utils/genomeTypes';

interface DataLayerSelectionProps {
  selectedLayers: DataLayer[];
  onLayerToggle: (layer: DataLayer) => void;
  onClearAll?: () => void;
  nightMode?: boolean;
  needsAttention?: boolean;
}

/**
 * The four functional layers, in picker order. Every visual — title, blurb,
 * platform, accent colour — is read from the shared tables rather than restated
 * here, so a card can never disagree with the chip that represents the same
 * assay elsewhere in the portal.
 */
const LAYER_ORDER: DataLayer[] = [
  'methylation',
  'expression',
  'chromatin_accessibility',
  'chromatin_conformation',
];

const layers = LAYER_ORDER.map((id) => {
  const token = DATA_TYPES[id];
  const info = DATA_LAYER_INFO[id];
  return {
    id,
    title: info.name,
    description: info.description,
    technology: info.type,
    hoverColor: token.cardHoverBorder,
    gradient: token.cardGradient,
    shadowGlow: token.cardGlow,
    borderColor: token.cardBorder,
  };
});

export default function DataLayerSelection({ selectedLayers, onLayerToggle, onClearAll, nightMode = false, needsAttention = false }: DataLayerSelectionProps) {
  return (
    <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} ${stepBorder(nightMode, needsAttention)} rounded-2xl shadow-fancy border p-6 hover-lift transition-all duration-300`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <StepBadge step={3} needsAttention={needsAttention} nightMode={nightMode} />
          <div>
            <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Functional Data Layers</h2>
            <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
              {selectedLayers.length} of {layers.length} layers selected
            </p>
          </div>
        </div>
        {selectedLayers.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              nightMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((layer) => {
          const isSelected = selectedLayers.includes(layer.id);
          return (
            <div key={layer.id} className="relative">
              <input
                type="checkbox"
                id={layer.id}
                checked={isSelected}
                onChange={() => onLayerToggle(layer.id)}
                className="sr-only peer"
              />
              <label htmlFor={layer.id} className="block cursor-pointer">
                <div
                  className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all min-h-[180px] flex flex-col peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 ${
                    isSelected
                      ? `${layer.borderColor} ${layer.shadowGlow} ${
                          nightMode ? 'bg-gray-700/70' : `bg-gradient-to-br ${layer.gradient}`
                        }`
                      : `${nightMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200'} ${layer.hoverColor}`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{layer.title}</h3>
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : nightMode
                            ? 'border-gray-500'
                            : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'} mb-2 flex-grow leading-relaxed`}>{layer.description}</p>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className={`w-4 h-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${dataTypeBadge(layer.id, nightMode)}`}>
                        {layer.technology}
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}


