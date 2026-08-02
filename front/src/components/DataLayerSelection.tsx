import { useEffect } from 'react';
import { CheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import StepBadge, { stepBorder } from './StepBadge';
import type { DataLayer } from '../utils/genomeTypes';

interface DataLayerSelectionProps {
  selectedLayers: DataLayer[];
  onLayerToggle: (layer: DataLayer) => void;
  onClearAll?: () => void;
  nightMode?: boolean;
  needsAttention?: boolean;
}

const layers: Array<{
  id: DataLayer;
  title: string;
  description: string;
  technology: string;
  colorClass: string;
  hoverColor: string;
  gradientFrom: string;
  gradientTo: string;
  shadowGlow: string;
  borderColor: string;
  badgeColor: string;
}> = [
  {
    id: 'methylation',
    title: 'DNA Methylation',
    description: 'CpG methylation profiles across genomes',
    technology: 'ONT / PacBio',
    colorClass: 'cyan',
    hoverColor: 'hover:border-cyan-300',
    gradientFrom: 'from-cyan-50',
    gradientTo: 'to-cyan-100',
    shadowGlow: 'shadow-glow-cyan',
    borderColor: 'border-cyan-500',
    badgeColor: 'bg-cyan-100 text-cyan-800',
  },
  {
    id: 'expression',
    title: 'Expression',
    description: 'Gene expression quantification data',
    technology: 'Iso-Seq',
    colorClass: 'green',
    hoverColor: 'hover:border-green-300',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-green-100',
    shadowGlow: 'shadow-glow-green',
    borderColor: 'border-green-500',
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'chromatin_accessibility',
    title: 'Chromatin Accessibility',
    description: 'Single-molecule chromatin accessibility and nucleosome positioning',
    technology: 'Fiber-seq',
    colorClass: 'orange',
    hoverColor: 'hover:border-orange-300',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100',
    shadowGlow: 'shadow-glow-orange',
    borderColor: 'border-orange-500',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'chromatin_conformation',
    title: 'Chromatin Conformation',
    description: '3D genome organization and chromatin interactions (Only available in CHM13)',
    technology: 'Omni-C',
    colorClass: 'purple',
    hoverColor: 'hover:border-purple-300',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-100',
    shadowGlow: 'shadow-glow-purple',
    borderColor: 'border-purple-500',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
];

export default function DataLayerSelection({ selectedLayers, onLayerToggle, onClearAll, nightMode = false, needsAttention = false }: DataLayerSelectionProps) {
  useEffect(() => {
    // Update visual states when layers change
    layers.forEach(layer => {
      const layerCard = document.querySelector(`.layer-card[data-layer="${layer.id}"]`);
      if (!layerCard) return;
      
      const checkbox = layerCard.querySelector('.layer-checkbox');
      const checkmark = layerCard.querySelector('.layer-checkmark');
      const isSelected = selectedLayers.includes(layer.id);
      
      if (isSelected) {
        layerCard.classList.add(
          layer.borderColor,
          'bg-gradient-to-br',
          layer.gradientFrom,
          layer.gradientTo,
          layer.shadowGlow
        );
        checkbox?.classList.add('bg-primary-600', 'border-primary-600');
        checkbox?.classList.remove('border-gray-300');
        checkmark?.classList.remove('hidden');
      } else {
        layerCard.classList.remove(
          layer.borderColor,
          'bg-gradient-to-br',
          layer.gradientFrom,
          layer.gradientTo,
          layer.shadowGlow
        );
        checkbox?.classList.remove('bg-primary-600', 'border-primary-600');
        checkbox?.classList.add('border-gray-300');
        checkmark?.classList.add('hidden');
      }
    });
  }, [selectedLayers]);

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
        {layers.map((layer) => (
          <div key={layer.id} className="relative">
            <input 
              type="checkbox" 
              id={layer.id} 
              checked={selectedLayers.includes(layer.id)}
              onChange={() => onLayerToggle(layer.id)}
              className="sr-only" 
            />
            <label htmlFor={layer.id} className="block cursor-pointer">
              <div 
                className={`layer-card border-2 ${nightMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl p-4 ${layer.hoverColor} hover:shadow-lg transition-all ${nightMode ? 'bg-gray-700/50' : ''} min-h-[180px] flex flex-col`}
                data-layer={layer.id}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{layer.title}</h3>
                  <div className={`layer-checkbox w-5 h-5 border-2 ${nightMode ? 'border-gray-500' : 'border-gray-300'} rounded flex items-center justify-center transition-all flex-shrink-0`}>
                    <CheckIcon className="layer-checkmark w-3.5 h-3.5 text-white hidden" />
                  </div>
                </div>
                <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'} mb-2 flex-grow leading-relaxed`}>{layer.description}</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className={`w-4 h-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${layer.badgeColor}`}>
                      {layer.technology}
                    </span>
                  </div>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}


