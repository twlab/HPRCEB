import StatsCards from './StatsCards';
import ReferenceGenomeSelection from './ReferenceGenomeSelection';
import GenomeSelection from './GenomeSelection';
import DataLayerSelection from './DataLayerSelection';
import DataVisualization from './DataVisualization';
import WorldMap from './WorldMap';
import PCAPlot from './PCAPlot';
import { getGenomeData, calculateTotalSize } from '../utils/genomeDataService';
import type { DataLayer, Population } from '../utils/genomeTypes';

export interface DataSelectorState {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  searchTerm: string;
  populationFilter: Population;
  referenceGenome: string;
}

interface DataSelectorProps {
  state: DataSelectorState;
  onStateChange: (state: DataSelectorState) => void;
  nightMode?: boolean;
}

export default function DataSelector({ state, onStateChange, nightMode = false }: DataSelectorProps) {
  const setState = (updater: (prev: DataSelectorState) => DataSelectorState) => {
    onStateChange(updater(state));
  };

  const totalSize = calculateTotalSize(state.selectedGenomes, state.selectedLayers);

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

  const genomeData = getGenomeData();

  // Calculate super_population counts
  const populationCounts = genomeData.reduce((acc, genome) => {
    if (genome.super_population) {
      acc[genome.super_population] = (acc[genome.super_population] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Stats Summary */}
      <StatsCards
        totalGenomes={genomeData.length}
        selectedGenomes={state.selectedGenomes.length}
        dataLayers={state.selectedLayers.length}
        totalSize={totalSize}
        nightMode={nightMode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Reference Genome and Sample Selection */}
        <div className="lg:col-span-1 space-y-6 animate-slide-in-left">
          <ReferenceGenomeSelection
            referenceGenome={state.referenceGenome}
            onReferenceGenomeChange={(genome) => setState(prev => ({ ...prev, referenceGenome: genome }))}
            nightMode={nightMode}
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
          />
        </div>

        {/* Right Panel: Data Type Selection and Visualization */}
        <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
          <DataLayerSelection
            selectedLayers={state.selectedLayers}
            onLayerToggle={handleLayerToggle}
            onClearAll={handleClearAllLayers}
            nightMode={nightMode}
          />

          <DataVisualization
            selectedGenomes={state.selectedGenomes}
            selectedLayers={state.selectedLayers}
            nightMode={nightMode}
          />
        </div>
      </div>

      {/* World Map - moved to bottom */}
      <div className="mt-8">
        <WorldMap
          selectedPopulation={state.populationFilter}
          populationCounts={populationCounts}
          selectedGenomes={state.selectedGenomes}
          onPopulationClick={(population) => setState(prev => ({ ...prev, populationFilter: population }))}
          nightMode={nightMode}
        />
      </div>

      {/* PCA Plot */}
      <div className="mt-8">
        <PCAPlot selectedGenomes={state.selectedGenomes} nightMode={nightMode} />
      </div>
    </>
  );
}

