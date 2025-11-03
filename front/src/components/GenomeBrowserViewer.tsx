import React from 'react';
import { useBrowserState } from "../utils/useBrowserState";
import { BrowserDisplay } from "./BrowserDisplay";
import type { TracksProps } from "../utils/browserTypes";

interface GenomeBrowserViewerProps {
  tracks?: TracksProps[];
}

export function GenomeBrowserViewer({ tracks: propTracks }: GenomeBrowserViewerProps) {
  const {
    viewRegion,
    genomeName,
    showGenomeNavigator,
    showNavBar,
    showToolBar,
    tracks: stateTracks,
  } = useBrowserState();

  // Use prop tracks if provided, otherwise fall back to state tracks
  const tracks = propTracks || stateTracks;

  return (
    <div className="flex flex-col min-h-full">
      <BrowserDisplay
        viewRegion={viewRegion}
        genomeName={genomeName}
        tracks={tracks}
        showGenomeNavigator={showGenomeNavigator}
        showNavBar={showNavBar}
        showToolBar={showToolBar}
      />
    </div>
  );
}

