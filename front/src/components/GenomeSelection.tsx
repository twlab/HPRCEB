import { ClipboardDocumentCheckIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getFilteredGenomes } from '../utils/genomeDataService';
import GenomeList from './GenomeList';
import StepBadge, { stepBorder } from './StepBadge';
import type { Population } from '../utils/genomeTypes';

interface GenomeSelectionProps {
  searchTerm: string;
  populationFilter: string;
  selectedGenomes: string[];
  onSearchChange: (term: string) => void;
  onPopulationFilterChange: (filter: string) => void;
  onDeselectAll: () => void;
  onGenomeToggle: (genomeId: string) => void;
  nightMode?: boolean;
  needsAttention?: boolean;
}

export default function GenomeSelection({
  searchTerm,
  populationFilter,
  selectedGenomes,
  onSearchChange,
  onPopulationFilterChange,
  onDeselectAll,
  onGenomeToggle,
  nightMode = false,
  needsAttention = false,
}: GenomeSelectionProps) {
  const filteredGenomes = getFilteredGenomes(searchTerm, populationFilter as Population);
  const showWarning = selectedGenomes.length > 5;

  return (
    <div>
      <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} ${stepBorder(nightMode, needsAttention)} rounded-2xl shadow-fancy border p-6 sticky top-8 hover-lift transition-all duration-300`}>
        <div className="flex items-center gap-3 mb-5">
          <StepBadge step={2} needsAttention={needsAttention} nightMode={nightMode} />
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Sample Selection</h2>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`w-5 h-5 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search genomes..." 
              className={`w-full pl-10 pr-4 py-3 border-2 ${nightMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md`}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="mb-4">
          <label className={`block text-sm font-bold ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Filter by Population</label>
          <select 
            value={populationFilter}
            onChange={(e) => onPopulationFilterChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 ${nightMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm hover:shadow-md transition-all font-medium`}
          >
            <option value="all">🌍 All Populations</option>
            <option value="afr">🌍 African</option>
            <option value="amr">🌎 American</option>
            <option value="eas">🌏 East Asian</option>
            <option value="eur">🌍 European</option>
            <option value="sas">🌏 South Asian</option>
          </select>
        </div>

        {/* Selection Counter and Clear Button */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className={`flex items-center gap-2 px-3 py-2.5 ${nightMode ? 'bg-gradient-to-r from-primary-900/50 to-primary-800/50' : 'bg-gradient-to-r from-primary-50 to-primary-100'} rounded-xl`}>
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-primary-600" />
            <span className={`text-sm font-bold ${nightMode ? 'text-primary-400' : 'text-primary-700'}`}>
              {selectedGenomes.length} selected
            </span>
          </div>
          {selectedGenomes.length > 0 && (
            <button 
              onClick={onDeselectAll}
              className={`px-4 py-2.5 text-xs font-bold ${nightMode ? 'text-gray-200 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100'} rounded-xl transition-all shadow-sm hover:shadow-md`}
            >
              ✗ Clear All
            </button>
          )}
        </div>

        {/* Warning Message for >5 samples */}
        {showWarning && (
          <div className={`mb-4 p-3 ${nightMode ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 rounded-r-lg`}>
            <div className="flex items-start">
              <ExclamationTriangleIcon className={`w-5 h-5 ${nightMode ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5 mr-2 flex-shrink-0`} />
              <div>
                <p className={`text-sm font-semibold ${nightMode ? 'text-yellow-200' : 'text-yellow-800'}`}>Performance Notice</p>
                <p className={`text-xs ${nightMode ? 'text-yellow-300' : 'text-yellow-700'} mt-1`}>You have selected more than 5 samples. The browser may experience slower performance.</p>
              </div>
            </div>
          </div>
        )}

        {/* Genome List */}
        <div className="max-h-[500px] overflow-y-auto">
          <GenomeList
            genomes={filteredGenomes}
            selectedGenomes={selectedGenomes}
            onGenomeToggle={onGenomeToggle}
            nightMode={nightMode}
          />
        </div>
      </div>
    </div>
  );
}


