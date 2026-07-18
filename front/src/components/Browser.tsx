import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
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
  viewRegion?: string;
  onViewRegionChange?: (viewRegion: string) => void;
}

/**
 * Parse userViewRegion string and convert float coordinates to integers.
 * Format: chrXXX:start-end where start and end might be floats.
 */
function normalizeViewRegion(viewRegion: string): string {
  const match = viewRegion.match(/^(chr[^:]+):([0-9.]+)-([0-9.]+)$/);
  if (!match) return viewRegion;

  const [, chr, startStr, endStr] = match;
  const start = Math.floor(parseFloat(startStr));
  const end = Math.floor(parseFloat(endStr));

  return `${chr}:${start}-${end}`;
}

export default function Browser({ tracks: tracksProp, selectedGenomes, referenceGenome, nightMode = false, onNavigateToDataSelector, viewRegion = "chr7:27053397-27153397", onViewRegionChange }: BrowserProps) {
  const browserTracks = tracksProp
    .filter(t => t.isSelected)
    .map(t => ({ ...t.displayAttributes }));  // Create new object without isSelected
  
  const [tracks, setTracks] = useState<TracksProps[]>(browserTracks);
  const [allTracks, setAllTracks] = useState<TracksProps[]>(browserTracks);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const browserContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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

  useEffect(() => {
    const selectedTracks = tracksProp
      .filter(t => t.isSelected)
      .map(t => ({ ...t.displayAttributes }));
    // console.log("Browser: selected count:", selectedTracks.length, "total:", tracksProp.length);
    // console.log("Browser: selected tracks:", selectedTracks.map(t => t.name));
    setAllTracks(selectedTracks);
    setTracks(selectedTracks);
    setIsLoadingTracks(false);
  }, [tracksProp]);

  useEffect(() => {
    setTracks(allTracks);
  }, [allTracks]);

  const storeId = useMemo(() => 'hprc-browser', []);

  const storeConfig = useMemo(() => ({ storeId }), [storeId]);

  // Capture viewRegion once on mount so switching tabs restores the last position
  const viewRegionMemo = useMemo(
    () => (viewRegion ? { genomeCoordinate: viewRegion } : undefined),
    [],
  );

  const onSessionUpdate = React.useCallback(
    (currentViewRegion: any) => {
      if (currentViewRegion === null) return;
      if (!Object.keys(currentViewRegion).includes('userViewRegion')) return;
      if (currentViewRegion.userViewRegion !== null) {
        onViewRegionChange?.(currentViewRegion.userViewRegion);
      }
    },
    [onViewRegionChange],
  );

  console.log(storeConfig)
  console.log(viewRegionMemo)
  console.log(tracks)
  console.log()

  return (
    <div
      className={`${isFullscreen ? 'h-screen' : 'h-full flex flex-col'} ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}
      style={{ minHeight: 0 }}
    >
      <div
        ref={browserContainerRef}
        className={`${isFullscreen ? 'h-full rounded-none' : 'rounded-2xl flex-1'} shadow-xl overflow-hidden flex flex-col ${nightMode ? 'border-gray-700' : 'border-gray-100'} border ${isFullscreen ? 'fullscreen-browser' : ''}`}
        style={!isFullscreen ? { minHeight: 0 } : {}}
      >
      {/* Header with Icon and Fullscreen Button */}
      <div className={`flex items-center gap-2 flex-shrink-0 px-4 py-1.5 border-b ${nightMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${nightMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <img
            src="./washu_epgg_logo.png"
            alt="HPRC Epigenome Browser"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className={`flex-1 text-sm font-semibold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>WashU Epigenome Browser</h2>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:shadow-md ${
            nightMode
              ? 'bg-primary-600 hover:bg-primary-500'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
          title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F)'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <>
              <ArrowsPointingInIcon className="w-4 h-4" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <ArrowsPointingOutIcon className="w-4 h-4" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Browser Container */}
      <div
        className="flex-1 flex flex-col"
        style={{ minHeight: 0 }}
      >
        <div
          className="flex-1 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <div className="genome-hub-host relative bg-white w-full h-full">
            <GenomeHub
              storeConfig={storeConfig}
              viewRegion={viewRegionMemo}
              genomeName={referenceGenome}
              tracks={tracks}
              onSessionUpdate={onSessionUpdate}

              showGenomeNavigator={true}
              showNavBar={true}
              showToolBar={true}

              showDisclosure={false}
              darkMode={nightMode}
            />
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
