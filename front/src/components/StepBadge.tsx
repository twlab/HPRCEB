/**
 * Shared chrome for the numbered Sample-tab steps. A step that still wants
 * input gets a lit border and a filled badge; once the user has made a
 * selection both dim back down so attention moves to whatever is left.
 */

interface StepBadgeProps {
  step: number;
  /** True while this step is still waiting on the user. */
  needsAttention: boolean;
  nightMode?: boolean;
}

/** Border (and ring) classes for a step's card. */
export function stepBorder(nightMode: boolean, needsAttention: boolean): string {
  if (needsAttention) {
    return nightMode
      ? 'border-primary-500 ring-2 ring-primary-500/30'
      : 'border-primary-400 ring-2 ring-primary-200';
  }
  return nightMode ? 'border-gray-700' : 'border-gray-100';
}

export default function StepBadge({ step, needsAttention, nightMode = false }: StepBadgeProps) {
  return (
    <span
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors duration-300 ${
        needsAttention
          ? 'bg-primary-600 text-white'
          : nightMode
            ? 'bg-gray-700 text-gray-400'
            : 'bg-gray-100 text-gray-500'
      }`}
      aria-hidden="true"
    >
      {step}
    </span>
  );
}
