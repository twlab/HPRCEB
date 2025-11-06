interface HeaderProps {
  nightMode: boolean;
  onToggleNightMode: () => void;
}

export default function Header({ nightMode, onToggleNightMode }: HeaderProps) {
  return (
    <header className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-fancy border-b relative overflow-hidden transition-colors duration-300`}>
      <div className={`absolute inset-0 ${nightMode ? 'bg-gradient-to-r from-primary-900/10 to-primary-800/10' : 'bg-gradient-to-r from-primary-500/5 to-primary-400/5'}`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 animate-fade-in-up">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="./logo.png" 
                alt="Human Pangenome Logo" 
                className="h-16 w-auto hover:scale-110 transition-transform duration-300"
              />
            </div>
            {/* Title */}
            <div>
              <h1 className={`text-4xl font-extrabold ${nightMode ? 'text-gray-100' : ''}`} style={!nightMode ? { color: '#3e5b95' } : {}}>
                HPRC Epigenome Browser
              </h1>
              <p className={`mt-2 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                Human Pangenome Reference Consortium - Epigenome Data Browser
              </p>
            </div>
          </div>
          
          {/* Night Mode Toggle */}
          <button
            onClick={onToggleNightMode}
            className={`${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} p-3 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg`}
            aria-label="Toggle night mode"
            title={nightMode ? "Switch to day mode" : "Switch to night mode"}
          >
            {nightMode ? (
              // Sun icon for day mode
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              // Moon icon for night mode
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}


