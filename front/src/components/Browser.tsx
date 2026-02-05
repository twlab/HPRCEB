import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GenomeHub } from "wuepgg";
import type { TracksProps } from '../utils/browserTypes';
import type { Track } from '../utils/trackSelection';
import "wuepgg/style.css";

interface BrowserProps {
  tracks: Track[];
  selectedGenomes: string[];
  referenceGenome: string;
  nightMode?: boolean;
  onNavigateToDataSelector?: () => void;
}

export default function Browser({ tracks: tracksProp, selectedGenomes, referenceGenome, nightMode = false, onNavigateToDataSelector }: BrowserProps) {
  // Filter to selected tracks only, and extract displayAttributes
  const browserTracks = tracksProp
    .filter(t => t.isSelected)
    .map(t => ({ ...t.displayAttributes }));  // Create new object without isSelected
  
  const [tracks, setTracks] = useState<TracksProps[]>(browserTracks);
  const [allTracks, setAllTracks] = useState<TracksProps[]>(browserTracks);
  console.log("tracks", tracks);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  
  // Fullscreen state and ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const browserContainerRef = useRef<HTMLDivElement>(null);
  
  // NavBar visibility state
  const [showNavBar, setShowNavBar] = useState(false);
  
  // Toggle fullscreen function
  const toggleFullscreen = async () => {
    if (!browserContainerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await browserContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Keyboard shortcut: F to toggle fullscreen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if F key is pressed (not in input/textarea)
      if (e.key === 'f' || e.key === 'F') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Update browser tracks when Track[] prop changes
  useEffect(() => {
    // Filter to selected tracks only, create new objects with just displayAttributes
    const selectedTracks = tracksProp
      .filter(t => t.isSelected)
      .map(t => ({ ...t.displayAttributes }));
    console.log("Browser: selected count:", selectedTracks.length, "total:", tracksProp.length);
    console.log("Browser: selected tracks:", selectedTracks.map(t => t.name));
    setAllTracks(selectedTracks);
    setTracks(selectedTracks);
    setIsLoadingTracks(false);
  }, [tracksProp]);

  // Sync tracks state with allTracks
  useEffect(() => {
    setTracks(allTracks);
  }, [allTracks]);

  // Generate a random storeId for GenomeHub
  const storeId = useMemo(() => {
    return `store-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
  }, []);

  // Fallback tracks for demonstration (can be removed once assembly loading is working)

  return (
    <div 
      ref={browserContainerRef}
      className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border py-6 hover-lift flex flex-col transition-colors duration-300 ${isFullscreen ? 'fullscreen-browser' : ''}`}
    >
      {/* Header with Icon and Fullscreen Button */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 px-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <img 
            src="https://epgg.github.io/assets/images/eg-51ea8bd8d2ca299ede6ceb5f1c987ff7.png" 
            alt="HPRC Epigenome Browser" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>WashU Epigenome Browser</h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
            Interactive genomic data visualization
          </p>
        </div>
        {/* NavBar Toggle Button */}
        <button
          onClick={() => setShowNavBar(!showNavBar)}
          className={`p-2.5 rounded-lg transition-all ${
            nightMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } hover:shadow-md`}
          title={showNavBar ? 'Hide Navigation Bar' : 'Show Navigation Bar'}
        >
          {showNavBar ? (
            // X Icon (Close)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Menu Icon (3 horizontal lines)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className={`p-2.5 rounded-lg transition-all ${
            nightMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } hover:shadow-md`}
          title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            // Compress/Exit Fullscreen Icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            // Expand/Enter Fullscreen Icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Statistics Cards - always show with placeholder data */}
      <div className="grid grid-cols-2 gap-3 mb-5 px-6">
        <div className={`${nightMode ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'} rounded-lg p-3 border`}>
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${nightMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div>
              <p className={`text-xs ${nightMode ? 'text-amber-300' : 'text-amber-600'} font-medium`}>Reference</p>
              <p className={`text-sm font-bold ${nightMode ? 'text-amber-100' : 'text-amber-900'}`}>{referenceGenome}</p>
            </div>
          </div>
        </div>

        <div className={`${nightMode ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} rounded-lg p-3 border`}>
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${nightMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <div>
              <p className={`text-xs ${nightMode ? 'text-green-300' : 'text-green-600'} font-medium`}>Tracks</p>
              <p className={`text-lg font-bold ${nightMode ? 'text-green-100' : 'text-green-900'}`}>{tracks.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Browser Container - always show with placeholder tracks */}
      <div className="flex-1">
        <div className="overflow-y-auto max-h-[800px]">
          <div className="relative bg-white w-full">
            <GenomeHub
                genomeName={referenceGenome}
                tracks={tracks}
                viewRegion={"chr7:27053397-27153397"}
                showGenomeNavigator={true}
                showNavBar={showNavBar}
                showToolBar={true}
                storeConfig={{storeId}}
              />
          </div>
        </div>
      </div>

      {/* Browser Documentation Hint */}
      {(
        <div className={`mt-4 space-y-2 px-6`}>
          <div className={`p-3 rounded-lg ${nightMode ? 'bg-gray-800/50 border-gray-700' : 'bg-primary-50 border-primary-200'} border flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${nightMode ? 'text-primary-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                💡 <strong>Need help using the browser?</strong> Check out the{' '}
                <a 
                  href="https://epgg.github.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 underline font-semibold"
                >
                  Browser Documentation
                </a>
              </p>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${nightMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'} border flex items-center gap-2`}>
            <svg className={`w-4 h-4 ${nightMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <p className={`text-xs ${nightMode ? 'text-purple-300' : 'text-purple-700'}`}>
              <strong>Quick Tip:</strong> Press <kbd className={`px-1.5 py-0.5 rounded text-xs font-semibold ${nightMode ? 'bg-purple-800 border-purple-600' : 'bg-purple-100 border-purple-300'} border`}>F</kbd> to toggle fullscreen or <kbd className={`px-1.5 py-0.5 rounded text-xs font-semibold ${nightMode ? 'bg-purple-800 border-purple-600' : 'bg-purple-100 border-purple-300'} border`}>ESC</kbd> to exit
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
