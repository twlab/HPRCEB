import { CheckIcon } from '@heroicons/react/24/outline';
import StepBadge, { stepBorder } from './StepBadge';

interface ReferenceGenomeSelectionProps {
  referenceGenome: string;
  onReferenceGenomeChange: (genome: string) => void;
  nightMode?: boolean;
  needsAttention?: boolean;
}

const AVAILABLE_GENOMES = [
  { value: "hg38", label: "GRCh38" },
  { value: "t2t-chm13-v2.0", label: "CHM13 T2T (v2.0)" },
];

export default function ReferenceGenomeSelection({
  referenceGenome,
  onReferenceGenomeChange,
  nightMode = false,
  needsAttention = false,
}: ReferenceGenomeSelectionProps) {
  const handleGenomeChange = (genome: string) => {
    onReferenceGenomeChange(genome);
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} ${stepBorder(nightMode, needsAttention)} rounded-2xl shadow-fancy border p-6 hover-lift transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-5">
        <StepBadge step={1} needsAttention={needsAttention} nightMode={nightMode} />
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Reference Genome</h2>
      </div>
      
      <div className="space-y-3">
        {AVAILABLE_GENOMES.map((genome) => (
          <button
            key={genome.value}
            onClick={() => handleGenomeChange(genome.value)}
            className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left font-semibold ${
              referenceGenome === genome.value
                ? nightMode
                  ? 'bg-gradient-to-br from-primary-900/50 to-primary-800/50 border-primary-500 text-gray-100 shadow-lg shadow-primary-500/20'
                  : 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-500 text-gray-900 shadow-lg shadow-primary-500/20'
                : nightMode
                  ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">{genome.label}</span>
              {referenceGenome === genome.value && (
                <CheckIcon className="w-5 h-5 text-primary-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

