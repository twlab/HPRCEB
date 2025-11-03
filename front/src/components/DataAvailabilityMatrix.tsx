import { getGenomeData } from '../utils/genomeDataService';
import AvailabilityMatrixTable from './AvailabilityMatrixTable';

interface DataAvailabilityMatrixProps {
  nightMode?: boolean;
}

export default function DataAvailabilityMatrix({ nightMode = false }: DataAvailabilityMatrixProps) {
  const genomeData = getGenomeData();

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      {/* Instructions */}
      <div className={`mb-4 p-4 ${nightMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-400'} border-l-4 rounded-r-lg`}>
        <div className="flex items-start">
          <svg className={`w-5 h-5 ${nightMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className={`text-sm ${nightMode ? 'text-blue-200' : 'text-blue-900'}`}>
              <strong>How to read this table:</strong> Each row shows a genome sample and its available data types. 
              Tags like <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${nightMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800'} mx-1`}>mat</span> or 
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${nightMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800'} mx-1`}>pat</span> indicate maternal/paternal haplotypes. 
              A <span className={`${nightMode ? 'text-gray-500' : 'text-gray-400'} mx-1`}>✗</span> means data is not available, while colored tags show available data tracks.
            </p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <AvailabilityMatrixTable genomes={genomeData} nightMode={nightMode} />
      </div>
    </div>
  );
}


