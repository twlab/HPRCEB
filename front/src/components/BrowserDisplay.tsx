import { GenomeHub } from "wuepgg";
import { TracksProps } from "../utils/browserTypes";

import "wuepgg/style.css";

interface BrowserDisplayProps {
  viewRegion: string | null | undefined;
  genomeName: string;
  tracks: TracksProps[];
  showGenomeNavigator: boolean;
  showNavBar: boolean;
  showToolBar: boolean;
}

export function BrowserDisplay({
  viewRegion,
  genomeName,
  tracks,
  showGenomeNavigator,
  showNavBar,
  showToolBar,
}: BrowserDisplayProps) {
  return (
    <div className="relative bg-white w-full">
      <GenomeHub
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

