import { useState } from "react";
import { TracksProps } from "./browserTypes";
import { defaultTracks } from "./browserTracks";

export function useBrowserState() {
  const [viewRegionInput, setViewRegionInput] = useState<string>(
    "chr7:27053397-27373765"
  );
  const [viewRegion, setViewRegion] = useState<string | null | undefined>(
    "chr7:27053397-27373765"
  );
  const [genomeName, setGenomeName] = useState<string>("hg38");
  const [showGenomeNavigator, setShowGenomeNavigator] = useState<boolean>(true);
  const [showNavBar, setShowNavBar] = useState<boolean>(false);
  const [showToolBar, setShowToolBar] = useState<boolean>(true);
  const [tracks, setTracks] = useState<TracksProps[]>(defaultTracks);

  const applyViewRegion = () => {
    setViewRegion(viewRegionInput);
  };

  const clearViewRegion = () => {
    setViewRegion(null);
    setViewRegionInput("");
  };

  return {
    viewRegionInput,
    setViewRegionInput,
    viewRegion,
    genomeName,
    setGenomeName,
    showGenomeNavigator,
    setShowGenomeNavigator,
    showNavBar,
    setShowNavBar,
    showToolBar,
    setShowToolBar,
    tracks,
    applyViewRegion,
    clearViewRegion,
  };
}

