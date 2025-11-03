export interface TracksProps {
  url?: string;
  name?: string;
  querygenome?: string;
  options?: { [key: string]: any };
  type: string;
  showOnHubLoad?: boolean;
  metadata?: { [key: string]: any };
}

export interface BrowserState {
  viewRegionInput: string;
  viewRegion: string | null | undefined;
  genomeName: string;
  showGenomeNavigator: boolean;
  showNavBar: boolean;
  showToolBar: boolean;
  selectedTrackSet: string;
  tracks: TracksProps[];
}

