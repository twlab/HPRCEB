import { UsersIcon } from '@heroicons/react/24/outline';
import { getGenomeData } from '../utils/genomeDataService';
import PopulationComposition from './PopulationComposition';
import CoverageSummary from './CoverageSummary';

interface CohortOverviewProps {
  nightMode?: boolean;
}

/**
 * Single panel pairing the population breakdown with assay coverage — one
 * column per view so they read as two halves of the same cohort summary.
 */
export default function CohortOverview({ nightMode = false }: CohortOverviewProps) {
  const total = getGenomeData().length;
  const card = nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const divider = nightMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${card} rounded-2xl shadow-fancy border p-6 mb-6 transition-colors duration-300`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <UsersIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Cohort &amp; Data Coverage
          </h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
            Who is in the {total.toLocaleString()}-sample cohort, and which assays they carry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-0">
        <div className="xl:pr-8">
          <PopulationComposition nightMode={nightMode} embedded />
        </div>
        <div className={`xl:pl-8 xl:border-l ${divider}`}>
          <CoverageSummary nightMode={nightMode} embedded />
        </div>
      </div>
    </div>
  );
}
