import React, { useState } from 'react';

interface TutorialsProps {
  nightMode?: boolean;
  onStartInteractiveGuide?: () => void;
}

export default function Tutorials({ nightMode = false, onStartInteractiveGuide }: TutorialsProps) {
  const [copiedSession, setCopiedSession] = useState(false);

  const exampleSession = `[
  {
    "id": "session_1761255625847_1d1eewse3",
    "name": "HG02257",
    "timestamp": 1761255625847,
    "dataSelectorState": {
      "selectedGenomes": ["HG02257"],
      "selectedLayers": ["expression", "methylation", "chromatin_accessibility", "chromatin_conformation"],
      "searchTerm": "HG02257",
      "populationFilter": "all",
      "referenceGenome": "hg38"
    },
    "currentTab": "sessions"
  }
]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exampleSession);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-8 hover-lift transition-colors duration-300`}>
      {/* Title */}
      <div className="flex justify-center items-center mb-6">
        <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tutorials & Documentation</h2>
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
            <span>Start Interactive Guide</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Getting Started */}
        <div className={`border-l-4 border-blue-500 ${nightMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-6 rounded-r-lg`}>
          <h3 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Getting Started</h3>
          <p className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
            Explore epigenomic data from the Human Pangenome Reference Consortium. The workflow is simple: <strong>Sample → Track → Browser → Sessions</strong>
          </p>
          <div className={`mt-3 pt-3 border-t ${nightMode ? 'border-gray-700' : 'border-blue-300'}`}>
            <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Browser Documentation:</strong>{' '}
              <a 
                href="https://epgg.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline font-semibold"
              >
                epgg.github.io
              </a>
            </p>
          </div>
        </div>

        {/* Quick Start Workflow */}
        <div className={`bg-gradient-to-r ${nightMode ? 'from-purple-900/40 to-primary-900/40 border-purple-700' : 'from-purple-50 to-primary-50 border-purple-300'} border-l-4 p-6 rounded-r-xl`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
            Quick Start
          </h3>
          <ol className={`space-y-2 text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-3">
              <span className={`font-bold text-purple-600 flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>1</span>
              <span><strong>Sample:</strong> Choose genomes and data layers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold text-purple-600 flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>2</span>
              <span><strong>Track:</strong> Configure which tracks to display</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold text-purple-600 flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>3</span>
              <span><strong>Browser:</strong> Visualize in WashU Epigenome Browser</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`font-bold text-purple-600 flex-shrink-0 ${nightMode ? 'bg-gray-700' : 'bg-white'} w-6 h-6 rounded-full flex items-center justify-center text-xs`}>4</span>
              <span><strong>Sessions:</strong> Save for later (optional)</span>
            </li>
          </ol>
        </div>

        {/* Tab-by-Tab Guide */}
        <div className="space-y-3">
          <h3 className={`text-lg font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Tab Guide</h3>
          
          {/* Tab 1: Sample */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-primary-900/30 to-cyan-900/30 border-primary-700' : 'bg-gradient-to-br from-primary-50 to-cyan-50 border-primary-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>1️⃣ Sample</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select genomes, choose data layers (Methylation/Expression/Chromatin Accessibility), and pick a reference genome (hg38 or chm13). Filter by population and view data visualizations.
            </p>
          </div>

          {/* Tab 2: Tracks */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>2️⃣ Track</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Configure which tracks to display in the browser. Enable/disable individual tracks, search and filter by type. Reference tracks (ruler, genes) and sample tracks (methylation, expression, genome alignments) can be customized. Note: Genome alignment tracks are always enabled.
            </p>
          </div>

          {/* Tab 3: Browser */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>3️⃣ Browser</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Visualize your configured tracks in the WashU Epigenome Browser. Navigate chromosomes, zoom in/out, and explore epigenomic data interactively. Supports fullscreen mode (press F or click the fullscreen button).
            </p>
          </div>

          {/* Tab 4: Sessions */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>💾 Sessions</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Save your complete configuration (genomes, data layers, and track selections) as sessions. Store up to 10 sessions, export/import as JSON, and quickly restore your work.
            </p>
          </div>

          {/* Tab 5: Data Availability Matrix */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-700' : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>📊 Data Availability Matrix</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Overview of all genomes and their available data types. Useful for quickly seeing what data is available across samples.
            </p>
          </div>

          {/* Tab 6: Tutorials */}
          <div className={`${nightMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} p-4 rounded-xl border`}>
            <h4 className={`text-sm font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>📚 Tutorials (Current Tab)</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Documentation and guides. You can also restart the interactive tutorial from here.
            </p>
          </div>
        </div>

        {/* Data Types */}
        <div className={`${nightMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} p-5 rounded-xl border`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>Available Data Layers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-cyan-600' : 'bg-white border-cyan-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <h4 className={`font-semibold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>DNA Methylation</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>ONT/PacBio • ~15 GB/sample</p>
            </div>
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-green-600' : 'bg-white border-green-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className={`font-semibold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Expression</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>Iso-Seq • ~8 GB/sample</p>
            </div>
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-orange-600' : 'bg-white border-orange-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h4 className={`font-semibold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Chromatin Accessibility</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>Fiber-seq • ~20 GB/sample</p>
            </div>
            <div className={`p-3 ${nightMode ? 'bg-gray-700 border-purple-600' : 'bg-white border-purple-200'} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h4 className={`font-semibold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Chromatin Conformation</h4>
              </div>
              <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>Omni-C • ~25 GB/sample</p>
            </div>
          </div>
        </div>

        {/* Reference Genomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`${nightMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
            <h4 className={`font-bold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>GRCh38</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current standard reference genome.
            </p>
          </div>
          <div className={`${nightMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} border rounded-xl p-3`}>
            <h4 className={`font-bold text-xs ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>CHM13 T2T (v2.0)</h4>
            <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              First complete gapless human genome.
            </p>
          </div>
        </div>

        {/* Session Import Example */}
        <div className={`${nightMode ? 'bg-gradient-to-r from-cyan-900/30 to-primary-900/30 border-cyan-700' : 'bg-gradient-to-r from-cyan-50 to-primary-50 border-cyan-400'} border-l-4 p-5 rounded-r-xl`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Session Import Example
          </h3>
          <p className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
            Go to the <strong>Sessions</strong> tab, click "Import Session", and paste this example:
          </p>
          <div className="relative">
            <pre className={`${nightMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'} p-3 rounded-lg text-xs overflow-x-auto`}>
              <code>{exampleSession}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className={`absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                copiedSession
                  ? 'bg-green-600 text-white'
                  : nightMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copiedSession ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className={`${nightMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-5`}>
          <h3 className={`text-md font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Quick Tips</h3>
          <ul className={`space-y-1 text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Start with 1-2 genomes (selecting 5+ may slow performance)</li>
            <li>• Use the Track tab to customize which tracks display in the Browser</li>
            <li>• Genome alignment tracks are always enabled and cannot be disabled</li>
            <li>• Use population filters to narrow genome selections</li>
            <li>• Save sessions to preserve your genome, data layer, and track selections</li>
            <li>• Press F or click the fullscreen button in the Browser for immersive viewing</li>
          </ul>
        </div>

        {/* Learn More */}
        <div className="text-center pt-4">
          <a 
            href="https://humanpangenome.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
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
