import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ReferenceGenomeSelection from './ReferenceGenomeSelection';
import GenomeSelection from './GenomeSelection';
import DataLayerSelection from './DataLayerSelection';
import DataVisualization from './DataVisualization';
import PopulationDataMap from './PopulationDataMap';
import PCAPlot from './PCAPlot';
import type { DataLayer, Population } from '../utils/genomeTypes';

export interface DataSelectorState {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  searchTerm: string;
  populationFilter: Population;
  referenceGenome: string;
  userViewRegion?: string;
}

interface DataSelectorProps {
  state: DataSelectorState;
  onStateChange: (state: DataSelectorState) => void;
  nightMode?: boolean;
  onNextTab?: () => void;
}

export default function DataSelector({ state, onStateChange, nightMode = false, onNextTab }: DataSelectorProps) {
  const [referencePicked, setReferencePicked] = useState(false);

  const setState = (updater: (prev: DataSelectorState) => DataSelectorState) => {
    onStateChange(updater(state));
  };

  const handleDeselectAllGenomes = () => {
    setState(prev => ({ ...prev, selectedGenomes: [] }));
  };

  const handleGenomeToggle = (genomeId: string) => {
    setState(prev => ({
      ...prev,
      selectedGenomes: prev.selectedGenomes.includes(genomeId)
        ? prev.selectedGenomes.filter(id => id !== genomeId)
        : [...prev.selectedGenomes, genomeId],
    }));
  };

  const handleLayerToggle = (layer: DataLayer) => {
    setState(prev => ({
      ...prev,
      selectedLayers: prev.selectedLayers.includes(layer)
        ? prev.selectedLayers.filter(l => l !== layer)
        : [...prev.selectedLayers, layer],
    }));
  };

  const handleClearAllLayers = () => {
    setState(prev => ({ ...prev, selectedLayers: [] }));
  };

  // Each numbered step stays lit until it has a selection, so the highlight
  // walks down the page as the user works through it. The reference genome
  // ships with a default, so it dims on the first explicit pick rather than on
  // "has a value".
  const noSamples = state.selectedGenomes.length === 0;
  const noLayers = state.selectedLayers.length === 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Reference Genome and Sample Selection */}
        <div className="lg:col-span-1 space-y-6 animate-slide-in-left">
          <ReferenceGenomeSelection
            referenceGenome={state.referenceGenome}
            onReferenceGenomeChange={(genome) => {
              setReferencePicked(true);
              setState(prev => ({ ...prev, referenceGenome: genome }));
            }}
            nightMode={nightMode}
            needsAttention={!referencePicked}
          />

          <GenomeSelection
            searchTerm={state.searchTerm}
            populationFilter={state.populationFilter}
            selectedGenomes={state.selectedGenomes}
            onSearchChange={(term) => setState(prev => ({ ...prev, searchTerm: term }))}
            onPopulationFilterChange={(filter) => setState(prev => ({ ...prev, populationFilter: filter as Population }))}
            onDeselectAll={handleDeselectAllGenomes}
            onGenomeToggle={handleGenomeToggle}
            nightMode={nightMode}
            needsAttention={noSamples}
          />
        </div>

        {/* Right Panel: Data Type Selection and Visualization */}
        <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
          <DataLayerSelection
            selectedLayers={state.selectedLayers}
            onLayerToggle={handleLayerToggle}
            onClearAll={handleClearAllLayers}
            nightMode={nightMode}
            needsAttention={noLayers}
          />

          <DataVisualization
            selectedGenomes={state.selectedGenomes}
            selectedLayers={state.selectedLayers}
            nightMode={nightMode}
            onReorderGenomes={(newOrder) => setState(prev => ({ ...prev, selectedGenomes: newOrder }))}
            onRemoveGenome={handleGenomeToggle}
            needsAttention={noSamples}
          />
        </div>
      </div>

      {/* World Map - moved to bottom */}
      <div className="mt-8">
        <PopulationDataMap
          selectedPopulation={state.populationFilter}
          onPopulationClick={(population) => setState(prev => ({ ...prev, populationFilter: population }))}
          nightMode={nightMode}
          showIcon={false}
        />
      </div>

      {/* PCA Plot */}
      <div className="mt-8">
        <PCAPlot selectedGenomes={state.selectedGenomes} nightMode={nightMode} />
      </div>

      {/* Next Tab Button */}
      {onNextTab && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onNextTab}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
              nightMode
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            Next: Track Configuration
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

