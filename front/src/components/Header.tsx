import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/20/solid';

interface HeaderProps {
  nightMode: boolean;
  onToggleNightMode: () => void;
  onReset: () => void;
}

export default function Header({ nightMode, onToggleNightMode, onReset }: HeaderProps) {
  return (
    <header className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-fancy border-b relative overflow-hidden transition-colors duration-300`}>
      <div className={`absolute inset-0 ${nightMode ? 'bg-gradient-to-r from-primary-900/10 to-primary-800/10' : 'bg-gradient-to-r from-primary-500/5 to-primary-400/5'}`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in-up">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="./logo.png"
                alt="Human Pangenome Logo"
                className="h-10 w-auto hover:scale-110 transition-transform duration-300"
              />
            </div>
            {/* Title */}
            <div>
              <h1 className={`text-2xl font-extrabold ${nightMode ? 'text-gray-100' : ''}`} style={!nightMode ? { color: '#3e5b95' } : {}}>
                HPRC Epigenome Browser
              </h1>
              <p className={`mt-0.5 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                Human Pangenome Reference Consortium - Epigenome Data Browser
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reset Button */}
            <button
              onClick={onReset}
              className={`${nightMode ? 'bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white' : 'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700'} p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-md`}
              aria-label="Reset selections"
              title="Reset all selections"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            {/* Night Mode Toggle */}
            <button
              onClick={onToggleNightMode}
              className={`${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-md`}
              aria-label="Toggle night mode"
              title={nightMode ? "Switch to day mode" : "Switch to night mode"}
            >
              {nightMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


