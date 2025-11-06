import { useEffect } from 'react';
import type { DataLayer } from '../utils/genomeTypes';

interface DataLayerSelectionProps {
  selectedLayers: DataLayer[];
  onLayerToggle: (layer: DataLayer) => void;
  onClearAll?: () => void;
  nightMode?: boolean;
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
    id: 'fiberseq',
    title: 'Fiber-seq',
    description: 'Single-molecule chromatin accessibility',
    technology: 'ONT / PacBio',
    colorClass: 'orange',
    hoverColor: 'hover:border-orange-300',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100',
    shadowGlow: 'shadow-glow-orange',
    borderColor: 'border-orange-500',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
];

export default function DataLayerSelection({ selectedLayers, onLayerToggle, onClearAll, nightMode = false }: DataLayerSelectionProps) {
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
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={`layer-card border-2 ${nightMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl p-5 ${layer.hoverColor} hover:shadow-lg transition-all ${nightMode ? 'bg-gray-700/50' : ''} min-h-[200px] flex flex-col`}
                data-layer={layer.id}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold text-base ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{layer.title}</h3>
                  <div className={`layer-checkbox w-6 h-6 border-2 ${nightMode ? 'border-gray-500' : 'border-gray-300'} rounded flex items-center justify-center transition-all`}>
                    <svg className="layer-checkmark w-4 h-4 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-600'} mb-3 flex-grow`}>{layer.description}</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                    </svg>
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


