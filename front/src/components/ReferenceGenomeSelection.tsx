interface ReferenceGenomeSelectionProps {
  referenceGenome: string;
  onReferenceGenomeChange: (genome: string) => void;
  nightMode?: boolean;
}

const AVAILABLE_GENOMES = [
  { value: "hg38", label: "GRCh38" },
  { value: "t2t-chm13-v2.0", label: "CHM13 T2T (v2.0)" },
];

export default function ReferenceGenomeSelection({ 
  referenceGenome, 
  onReferenceGenomeChange, 
  nightMode = false 
}: ReferenceGenomeSelectionProps) {
  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Reference Genome</h2>
      </div>
      
      <div className="space-y-3">
        {AVAILABLE_GENOMES.map((genome) => (
          <button
            key={genome.value}
            onClick={() => onReferenceGenomeChange(genome.value)}
            className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left font-semibold ${
              referenceGenome === genome.value
                ? nightMode
                  ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-500 text-gray-100 shadow-lg shadow-blue-500/20'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 text-gray-900 shadow-lg shadow-blue-500/20'
                : nightMode
                  ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">{genome.label}</span>
              {referenceGenome === genome.value && (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

