import type { Genome } from '../utils/genomeTypes';
import type { DataType } from '../utils/genomeDataService';
import { hasDataType } from '../utils/genomeDataService';
import { POPULATION_EMOJI } from '../utils/constants';
import { DATA_TYPES, sexBadge, superPopBadge } from '../utils/theme';

/** Availability pips shown under a sample, in picker order. */
const LAYER_ORDER: DataType[] = [
  'methylation',
  'expression',
  'chromatin_accessibility',
  'chromatin_conformation',
];

interface GenomeListProps {
  genomes: Genome[];
  selectedGenomes: string[];
  onGenomeToggle: (genomeId: string) => void;
  nightMode?: boolean;
}

export default function GenomeList({ genomes, selectedGenomes, onGenomeToggle, nightMode = false }: GenomeListProps) {
  if (genomes.length === 0) {
    return (
      <div className={`text-center py-8 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="text-sm">No genomes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {genomes.map((genome) => {
        const isSelected = selectedGenomes.includes(genome.id);
        const sex = genome.sex || 'unknown';
        const sexIcon = sex === 'male' ? '♂' : sex === 'female' ? '♀' : '?';
        
        // Use population_abbreviation if available, otherwise fall back to super_population
        const populationCode = genome.population_abbreviation || genome.super_population || '';
        const populationEmoji = POPULATION_EMOJI[genome.super_population || ''] || '🌍';
        
        // Check if parent IDs exist and are not N/A
        const hasParents = (genome.paternal_id && genome.paternal_id !== 'N/A') ||
                          (genome.maternal_id && genome.maternal_id !== 'N/A');

        // Check data availability from track data
        const availableLayers = LAYER_ORDER.filter((layer) => hasDataType(genome.id, layer));

        return (
          <div
            key={genome.id}
            className={`genome-item p-4 border-2 rounded-xl cursor-pointer transition-all hover-lift ${
              isSelected
                ? nightMode 
                  ? "border-primary-500 bg-gradient-to-r from-primary-900/50 to-primary-800/50 shadow-md"
                  : "border-primary-400 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md"
                : nightMode
                  ? "border-gray-600 hover:border-primary-500 hover:shadow-md bg-gray-700/50"
                  : "border-gray-200 hover:border-primary-200 hover:shadow-md bg-white"
            }`}
            onClick={() => onGenomeToggle(genome.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onGenomeToggle(genome.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={`genome-checkbox w-5 h-5 text-primary-600 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${
                      nightMode 
                        ? 'border-gray-400 bg-gray-600 checked:bg-primary-600 checked:border-primary-600' 
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>{genome.id}</h3>
                    {hasParents && (
                      <div className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {genome.paternal_id && genome.paternal_id !== 'N/A' && <span className="mr-2">♂ {genome.paternal_id}</span>}
                        {genome.maternal_id && genome.maternal_id !== 'N/A' && <span>♀ {genome.maternal_id}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 ml-8">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${superPopBadge(genome.super_population || '', nightMode)}`}>
                    {populationEmoji} {populationCode}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${sexBadge(sex, nightMode)}`}
                    title={sex === 'unknown' ? 'Sex not recorded' : sex}
                  >
                    {sexIcon}
                  </span>
                </div>
                {/* Availability pips, coloured from the shared assay palette so
                    they read the same as the chips on every other tab. */}
                {availableLayers.length > 0 && (
                  <div className="mt-2 ml-8 flex gap-1.5">
                    {availableLayers.map((layer) => (
                      <span
                        key={layer}
                        className={`w-2.5 h-2.5 rounded-full shadow-sm bg-gradient-to-br ${DATA_TYPES[layer].pip}`}
                        title={DATA_TYPES[layer].label}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
