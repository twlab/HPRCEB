interface TutorialsProps {
  nightMode?: boolean;
  onStartInteractiveGuide?: () => void;
}

export default function Tutorials({ nightMode = false, onStartInteractiveGuide }: TutorialsProps) {
  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-8 hover-lift transition-colors duration-300`}>
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-6">
        <img src="./logo.png" alt="Human Pangenome Logo" className="h-20 w-auto mb-4 animate-pulse-slow" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tutorials & Documentation</h2>
        </div>
      </div>

      {/* Interactive Guide Button */}
      {onStartInteractiveGuide && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={onStartInteractiveGuide}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 text-lg animate-pulse-slow"
          >
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>🎯 Start Interactive Guide</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Getting Started */}
        <div className={`border-l-4 border-blue-500 ${nightMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-6 rounded-r-lg`}>
          <h3 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>🚀 Getting Started</h3>
          <p className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
            Welcome to the HPRC Epigenome Navigator! This tool allows you to explore, visualize, and save your selections of epigenomic data from the Human Pangenome Reference Consortium Year 2 release.
          </p>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'} italic mb-3`}>
            The portal is organized into five main tabs following a natural workflow: <strong>Select → View → Save → Reference → Help</strong>
          </p>
          <div className={`mt-3 pt-3 border-t ${nightMode ? 'border-gray-700' : 'border-blue-300'}`}>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📚 <strong>Browser Documentation:</strong> For detailed information about the WashU Epigenome Browser features and usage, visit{' '}
              <a 
                href="https://epgg.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                epgg.github.io
              </a>
            </p>
          </div>
        </div>

        {/* Quick Start Workflow */}
        <div className={`bg-gradient-to-r ${nightMode ? 'from-purple-900/40 to-blue-900/40 border-purple-700' : 'from-purple-50 to-blue-50 border-purple-300'} border-l-4 p-6 rounded-r-xl`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Quick Start - Your First Session
          </h3>
          <ol className={`space-y-3 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0 bg-white dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              <span><strong>Select Data:</strong> Use the Data Selector tab to choose genomes (e.g., search for "HG002") and data layers (Methylation, Expression, Fiber-seq)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0 bg-white dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              <span><strong>Visualize:</strong> Switch to the Browser tab to explore your selections in an interactive genome browser</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0 bg-white dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              <span><strong>Save:</strong> Go to the Sessions tab to save your selections for future access</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0 bg-white dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              <span><strong>Return:</strong> Load your saved session anytime to pick up where you left off</span>
            </li>
          </ol>
        </div>

        {/* Tab-by-Tab Guide */}
        <div className="space-y-4">
          <h3 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>📑 Navigation Guide</h3>
          
          {/* Tab 1: Data Selector */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} p-5 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h4 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab 1: Data Selector</h4>
            </div>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <strong>Purpose:</strong> Your main workspace for selecting genomes and configuring data
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <p className={`text-xs font-semibold ${nightMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>Left Panel - Genome Selection:</p>
                <ul className={`space-y-1 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
                  <li>• Search genomes by ID or name</li>
                  <li>• Filter by population (AFR, AMR, EAS, EUR, SAS)</li>
                  <li>• See selection count in real-time</li>
                  <li>• Clear all selections quickly</li>
                  <li>• Each genome shows available data layers</li>
                </ul>
              </div>
              <div>
                <p className={`text-xs font-semibold ${nightMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>Right Panel - Data Configuration:</p>
                <ul className={`space-y-1 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
                  <li>• <strong>Reference Genome:</strong> Choose GRCh38 or CHM13 T2T (v2.0)</li>
                  <li>• <strong>Data Layers:</strong> Select functional data types</li>
                  <li>• <strong>Visualizations:</strong> View selections as table, chart, world map, or PCA plot</li>
                  <li>• See total data size in real-time</li>
                </ul>
              </div>
            </div>
            <div className={`mt-3 p-3 ${nightMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg`}>
              <p className={`text-xs ${nightMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>⚠️ Performance Note:</strong> Selecting more than 5 genomes may slow down browser performance.
              </p>
            </div>
          </div>

          {/* Tab 2: Browser */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'} p-5 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔬</span>
              <h4 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab 2: Browser</h4>
            </div>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <strong>Purpose:</strong> Interactive genome browser powered by WashU Epigenome Browser
            </p>
            <ul className={`space-y-1 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
              <li>• <strong>Full-width display</strong> for maximum viewing area</li>
              <li>• Shows genomes and data layers selected in Data Selector tab</li>
              <li>• Navigate chromosomes and zoom into regions of interest</li>
              <li>• View tracks in real-time with smooth interactions</li>
              <li>• Uses reference genome selected in Data Selector</li>
            </ul>
            <div className={`mt-3 p-3 ${nightMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
              <p className={`text-xs ${nightMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>💡 Tip:</strong> Configure your selections in the Data Selector tab first, then switch to Browser tab to visualize.
              </p>
            </div>
          </div>

          {/* Tab 3: Sessions */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} p-5 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💾</span>
              <h4 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab 3: Sessions (NEW!)</h4>
            </div>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <strong>Purpose:</strong> Save and manage your data selections for quick access later
            </p>
            <ul className={`space-y-1 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
              <li>• <strong>Save Sessions:</strong> Store up to 10 sessions with custom names</li>
              <li>• <strong>Load Sessions:</strong> Restore all your selections with one click</li>
              <li>• <strong>Manage:</strong> Rename or delete saved sessions</li>
              <li>• <strong>Export/Import:</strong> Backup sessions as JSON files</li>
              <li>• <strong>Reset Landing Page:</strong> Re-enable the landing page if you skipped it</li>
              <li>• Sessions persist across browser sessions (stored in cookies for 365 days)</li>
            </ul>
            <div className={`mt-3 p-3 ${nightMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg`}>
              <p className={`text-xs ${nightMode ? 'text-green-300' : 'text-green-800'}`}>
                <strong>✨ Pro Tip:</strong> Save different sessions for different research projects or comparisons!
              </p>
            </div>
          </div>

          {/* Tab 4: Data Availability Matrix */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-700' : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200'} p-5 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h4 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab 4: Data Availability Matrix</h4>
            </div>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              <strong>Purpose:</strong> Quick overview of available data across all genomes
            </p>
            <ul className={`space-y-1 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
              <li>• View all 94 genomes at a glance</li>
              <li>• See which data types (Methylation, Expression, Fiber-seq) are available for each genome</li>
              <li>• Check reference genome availability (GRCh38, CHM13 T2T)</li>
              <li>• Click any row to see detailed track information</li>
              <li>• Filter and search across the entire dataset</li>
            </ul>
          </div>

          {/* Tab 5: Tutorials */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'} p-5 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <h4 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab 5: Tutorials (You Are Here!)</h4>
            </div>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Documentation, guides, and best practices for using the HPRC Epigenome Navigator
            </p>
          </div>
        </div>

        {/* Data Types */}
        <div className={`${nightMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} p-6 rounded-xl border`}>
          <div className="flex items-center gap-2 mb-3">
            <svg className={`w-5 h-5 ${nightMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Available Data Types</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-blue-600' : 'bg-white border-blue-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className={`font-semibold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>DNA Methylation</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Long-read CpG methylation patterns</p>
              <ul className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li><strong>Platform:</strong> ONT / PacBio</li>
                <li><strong>Size:</strong> ~15 GB/sample</li>
              </ul>
            </div>
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-green-600' : 'bg-white border-green-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className={`font-semibold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Expression</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Gene expression quantification</p>
              <ul className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li><strong>Platform:</strong> Iso-Seq</li>
                <li><strong>Size:</strong> ~8 GB/sample</li>
              </ul>
            </div>
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-purple-600' : 'bg-white border-purple-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h4 className={`font-semibold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Fiber-seq</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Chromatin accessibility & nucleosomes</p>
              <ul className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li><strong>Platform:</strong> ONT / PacBio</li>
                <li><strong>Size:</strong> ~20 GB/sample</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Session Management Guide */}
        <div className={`${nightMode ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-700' : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400'} border-l-4 p-6 rounded-r-xl`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
            <svg className={`w-5 h-5 ${nightMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            Working with Sessions
          </h3>
          <div className={`space-y-3 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div>
              <p className="font-semibold mb-1">🔹 What gets saved in a session?</p>
              <ul className="ml-4 space-y-1">
                <li>• Selected genomes</li>
                <li>• Selected data layers (Methylation, Expression, Fiber-seq)</li>
                <li>• Population filter</li>
                <li>• Reference genome (GRCh38 or CHM13 T2T)</li>
                <li>• Search terms and current tab</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">🔹 Best practices:</p>
              <ul className="ml-4 space-y-1">
                <li>• Give sessions descriptive names (e.g., "HG002 Methylation Study" or "African Pop Comparison")</li>
                <li>• Export sessions periodically as backup</li>
                <li>• Delete old sessions you no longer need (10 session limit)</li>
                <li>• Load a session before switching to Browser tab for best results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips & Best Practices */}
        <div className={`${nightMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-6`}>
          <div className="flex items-start gap-3">
            <svg className={`w-6 h-6 ${nightMode ? 'text-yellow-400' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>💡 Tips & Best Practices</h3>
              <ul className={`space-y-1 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• <strong>Start simple:</strong> Begin with 1-2 genomes to get familiar with the interface</li>
                <li>• <strong>Use population filters:</strong> Narrow down genomes by ancestry (AFR, AMR, EAS, EUR, SAS)</li>
                <li>• <strong>Save your work:</strong> Create sessions for different research projects or data combinations</li>
                <li>• <strong>Choose reference genome first:</strong> Select GRCh38 or CHM13 T2T before choosing data layers</li>
                <li>• <strong>Browser optimized:</strong> The Browser tab uses full-width for better visualization</li>
                <li>• <strong>Persistent selections:</strong> All selections persist when switching between tabs</li>
                <li>• <strong>Monitor data size:</strong> Watch the total data size indicator when selecting multiple genomes</li>
                <li>• <strong>Skip landing page:</strong> Check "Skip this page in the future" on the landing page for quicker access</li>
                <li>• <strong>Night mode:</strong> Toggle night mode (top right) for comfortable viewing in low-light conditions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reference Genomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${nightMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
            <h4 className={`font-bold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>📌 GRCh38</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The Genome Reference Consortium Human Build 38, the current standard reference genome assembly. Widely used in genomics research and clinical applications.
            </p>
          </div>
          <div className={`${nightMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4`}>
            <h4 className={`font-bold text-sm ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>📌 CHM13 T2T (v2.0)</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The Telomere-to-Telomere CHM13 assembly, the first complete human genome assembly without gaps. Includes previously inaccessible regions like centromeres.
            </p>
          </div>
        </div>

        {/* Example Workflow */}
        <div className={`${nightMode ? 'bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border-orange-700' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-400'} border-l-4 p-6 rounded-r-xl`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
            <svg className={`w-5 h-5 ${nightMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            Example Workflow: Comparing Methylation Across Populations
          </h3>
          <ol className={`space-y-3 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>1</span>
              <span><strong>Data Selector:</strong> Filter by "AFR" population, select 2-3 genomes (e.g., HG002, HG005)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>2</span>
              <span><strong>Configure:</strong> Choose "GRCh38" reference and select "Methylation" layer</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>3</span>
              <span><strong>Browser:</strong> Switch to Browser tab to visualize methylation patterns</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>4</span>
              <span><strong>Save:</strong> Go to Sessions tab and save as "AFR Methylation Comparison"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>5</span>
              <span><strong>Compare:</strong> Repeat for other populations (EUR, EAS) and save as separate sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold ${nightMode ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>6</span>
              <span><strong>Quick Switch:</strong> Load any saved session to quickly switch between comparisons</span>
            </li>
          </ol>
        </div>

        {/* Learn More */}
        <div className="text-center pt-4">
          <a 
            href="https://humanpangenome.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Learn More About HPRC
          </a>
        </div>
      </div>
    </div>
  );
}
