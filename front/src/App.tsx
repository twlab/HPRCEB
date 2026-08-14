import { useState, useEffect, useRef } from 'react';
import { ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Header from './components/Header';
import TabNavigation, { TABS, TabType } from './components/TabNavigation';
import DataAvailabilityMatrix from './components/DataAvailabilityMatrix';
import DataSelector, { DataSelectorState } from './components/DataSelector';
import Tracks from './components/Tracks';
import Browser from './components/Browser';
import Tutorials from './components/Tutorials';
import Sessions from './components/Sessions';
import About from './components/About';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InteractiveTutorial from './components/InteractiveTutorial';
import CookieBanner from './components/CookieBanner';
import CookieSettings from './components/CookieSettings';
import { loadGenomeData, loadTrackData, TrackEntry } from './utils/genomeDataService';
import { getCookie } from './utils/cookieUtils';
import { selectTracks, Track } from './utils/trackSelection';
import './style.css';

function App() {
  // Check if user wants to skip landing page
  const skipLanding = getCookie('hprc_skip_landing') === 'true';
  const [showLanding, setShowLanding] = useState(!skipLanding);
  
  // Validate against the one list of tabs rather than a second copy that has to
  // be kept in step with it. An unrecognised `?tab=` used to be accepted and
  // then matched nothing in the render, leaving the page body blank.
  const toTabType = (value: string | null): TabType | null =>
    value && TABS.some((t) => t.id === value) ? (value as TabType) : null;

  const getInitialTab = (): TabType =>
    toTabType(new URLSearchParams(window.location.search).get('tab')) ?? 'sample';

  // Lazy initialiser: passing `getInitialTab()` re-parsed the query string on
  // every render just to throw the result away.
  const [currentTab, setCurrentTab] = useState<TabType>(getInitialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Tutorial state
  const tutorialCompleted = localStorage.getItem('hprc_tutorial_completed') === 'true';
  const [showTutorial, setShowTutorial] = useState(false);
  // Where the user was before the tour drove them around the tabs.
  const tutorialReturnTab = useRef<TabType>('sample');
  
  // Shared state for DataSelector and Browser
  const [dataSelectorState, setDataSelectorState] = useState<DataSelectorState>({
    selectedGenomes: [],
    selectedLayers: [],
    searchTerm: '',
    populationFilter: 'all',
    referenceGenome: 'hg38',
  });

  // Available tracks loaded from tracks.tsv (dictionary: sample_id -> TrackEntry[])
  const [availableTracks, setAvailableTracks] = useState<Record<string, TrackEntry[]>>({});
  
  // Selected tracks to display (result of selectTracks)
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  
  // The last inputs selectTracks was run against. Regeneration is driven by
  // comparing against this rather than by a "skip the next run" flag on a
  // 100 ms timer: loading a session sets the selection and the restored track
  // choices together, and whether the timer outlived the re-render decided
  // whether those choices survived. On a slow render they silently did not.
  const lastTrackInputs = useRef<{ key: string; source: Record<string, TrackEntry[]> } | null>(null);

  const trackInputsKey = (state: DataSelectorState) =>
    JSON.stringify([state.referenceGenome, state.selectedGenomes, state.selectedLayers]);

  // Fire selectTracks only when reference, samples, or functional data layers change
  useEffect(() => {
    const key = trackInputsKey(dataSelectorState);
    const previous = lastTrackInputs.current;
    if (previous && previous.key === key && previous.source === availableTracks) {
      return;
    }
    lastTrackInputs.current = { key, source: availableTracks };

    const result = selectTracks({
      selectedSamples: dataSelectorState.selectedGenomes,
      reference: dataSelectorState.referenceGenome,
      availableTracks: availableTracks,
      selectedLayers: dataSelectorState.selectedLayers,
    });

    setSelectedTracks(result.tracks);
  }, [dataSelectorState, availableTracks]);

  // Load genome and track data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await loadGenomeData();
        const tracks = await loadTrackData();
        setAvailableTracks(tracks);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page or contact support.');
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Show tutorial after landing page for first-time users
  useEffect(() => {
    if (!showLanding && !tutorialCompleted && !isLoading && !error) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        tutorialReturnTab.current = currentTab;
        setShowTutorial(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    // `currentTab` is read, not tracked: re-running on every tab change would
    // relaunch the tour while the user is working.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLanding, tutorialCompleted, isLoading, error]);

  // Mirror of `currentTab` for the popstate listener, which is registered once
  // and would otherwise read the value from its first render forever.
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  // Set while applying a Back/Forward navigation, so the effect below does not
  // push the entry the user just navigated away from straight back on.
  const fromHistoryNavigation = useRef(false);
  const historyInitialised = useRef(false);

  // Reflect the current tab in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', currentTab);
    const url = `${window.location.pathname}?${params.toString()}`;

    if (fromHistoryNavigation.current) {
      // The entry already exists — pushing here appended a duplicate, which
      // discarded the forward stack and made the Forward button dead.
      fromHistoryNavigation.current = false;
      return;
    }

    if (historyInitialised.current) {
      window.history.pushState({ tab: currentTab }, '', url);
    } else {
      // First run is the page the user just opened. Pushing here meant the
      // first Back press only landed on the same view again.
      historyInitialised.current = true;
      window.history.replaceState({ tab: currentTab }, '', url);
    }
  }, [currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const next =
        toTabType((event.state as { tab?: string } | null)?.tab ?? null) ??
        toTabType(params.get('tab'));

      if (!next || next === currentTabRef.current) return;
      fromHistoryNavigation.current = true;
      setCurrentTab(next);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler to navigate to Sample tab
  const handleNavigateToDataSelector = () => {
    setCurrentTab('sample');
  };

  // Tutorial handlers
  const handleTutorialComplete = () => {
    localStorage.setItem('hprc_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('hprc_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem('hprc_tutorial_completed');
    tutorialReturnTab.current = currentTab;
    setShowTutorial(true);
  };

  const handleResetConfirm = () => {
    setDataSelectorState({
      selectedGenomes: [],
      selectedLayers: [],
      searchTerm: '',
      populationFilter: 'all',
      referenceGenome: 'hg38',
    });
    setSelectedTracks([]);
    setCurrentTab('sample');
    setShowResetConfirm(false);
  };

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div
        className={`fixed inset-0 ${nightMode ? 'bg-gray-950/50' : 'bg-gray-900/50'} flex items-center justify-center z-50`}
        role="status"
        aria-live="polite"
      >
        <div className={`${nightMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'} rounded-lg p-8 max-w-sm`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-center">Loading genome data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md" role="alert">
        <div className="flex items-start">
          <ExclamationCircleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  // Show main application
  return (
    <div
      className={`${nightMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-primary-50 to-gray-50'} transition-colors duration-300`}
      style={currentTab === 'browser' ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Interactive Tutorial Overlay */}
      {showTutorial && (
        <InteractiveTutorial
          nightMode={nightMode}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          onTabChange={setCurrentTab}
          returnTab={tutorialReturnTab.current}
        />
      )}

      <Header nightMode={nightMode} onToggleNightMode={() => setNightMode(!nightMode)} onReset={() => setShowResetConfirm(true)} />
      <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} nightMode={nightMode} />
      
      {/* Browser tab: no padding so GenomeHub doesn't double-render; use flex to fill viewport */}
      {currentTab === 'browser' ? (
        // NOTE: padding here causes GenomeHub to rerender twice — keep this wrapper padding-free
        <main className="flex flex-col flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>
          <section className="flex-1 flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
            <Browser
              tracks={selectedTracks}
              referenceGenome={dataSelectorState.referenceGenome}
              nightMode={nightMode}
              viewRegion={dataSelectorState.userViewRegion}
              onViewRegionChange={(region) => {
                setDataSelectorState(prev => {
                  if (prev.userViewRegion === region) return prev;
                  return { ...prev, userViewRegion: region };
                });
              }}
            />
          </section>
        </main>
      ) : currentTab === 'tracks' ? (
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Tracks
            tracks={selectedTracks}
            referenceGenome={dataSelectorState.referenceGenome}
            nightMode={nightMode}
            onTracksChange={setSelectedTracks}
            onNavigateToDataSelector={handleNavigateToDataSelector}
            onNextTab={() => setCurrentTab('browser')}
          />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {currentTab === 'availability-matrix' && <DataAvailabilityMatrix nightMode={nightMode} />}
          {currentTab === 'sample' && (
            <DataSelector 
              state={dataSelectorState} 
              onStateChange={setDataSelectorState}
              nightMode={nightMode}
              onNextTab={() => setCurrentTab('tracks')}
            />
          )}
          {currentTab === 'tutorials' && (
            <Tutorials 
              nightMode={nightMode}
              onStartInteractiveGuide={handleRestartTutorial}
            />
          )}
          {currentTab === 'sessions' && (
            <Sessions
              dataSelectorState={dataSelectorState}
              selectedTracks={selectedTracks}
              onLoadSession={(state, tracks) => {
                // Record the incoming selection as already applied, so the
                // regeneration effect sees no change and leaves the session's
                // per-track choices intact.
                lastTrackInputs.current = { key: trackInputsKey(state), source: availableTracks };
                // Restore both states (dataSelectorState includes userViewRegion)
                setSelectedTracks(tracks);
                setDataSelectorState(state);
              }}
              nightMode={nightMode}
              onNavigateToSampleTab={handleNavigateToDataSelector}
            />
          )}
          {currentTab === 'about' && <About nightMode={nightMode} />}
        </main>
      )}

      <Footer 
        nightMode={nightMode} 
        onOpenCookieSettings={() => setShowCookieSettings(true)} 
      />
      
      {/* Cookie consent banner */}
      <CookieBanner 
        nightMode={nightMode} 
        onShowSettings={() => setShowCookieSettings(true)} 
      />
      
      {/* Cookie settings modal */}
      <CookieSettings 
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
        nightMode={nightMode}
      />

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className={`relative ${nightMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${nightMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'}`}>
                <ArrowPathIcon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">Reset All Selections?</h2>
            </div>

            <p className={`text-sm mb-4 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You currently have the following selected:
            </p>

            <div className={`rounded-xl p-4 mb-5 text-sm space-y-2 ${nightMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
              <div className="flex justify-between">
                <span className={nightMode ? 'text-gray-400' : 'text-gray-500'}>Reference genome</span>
                <span className="font-semibold">{dataSelectorState.referenceGenome}</span>
              </div>
              <div className="flex justify-between">
                <span className={nightMode ? 'text-gray-400' : 'text-gray-500'}>Samples selected</span>
                <span className="font-semibold">
                  {dataSelectorState.selectedGenomes.length > 0
                    ? `${dataSelectorState.selectedGenomes.length} sample${dataSelectorState.selectedGenomes.length > 1 ? 's' : ''}`
                    : <span className={nightMode ? 'text-gray-500' : 'text-gray-400'}>None</span>}
                </span>
              </div>
              {dataSelectorState.selectedGenomes.length > 0 && (
                <div className={`text-xs pl-1 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {dataSelectorState.selectedGenomes.slice(0, 5).join(', ')}
                  {dataSelectorState.selectedGenomes.length > 5 && ` +${dataSelectorState.selectedGenomes.length - 5} more`}
                </div>
              )}
              <div className="flex justify-between">
                <span className={nightMode ? 'text-gray-400' : 'text-gray-500'}>Data layers</span>
                <span className="font-semibold">
                  {dataSelectorState.selectedLayers.length > 0
                    ? `${dataSelectorState.selectedLayers.length} layer${dataSelectorState.selectedLayers.length > 1 ? 's' : ''}`
                    : <span className={nightMode ? 'text-gray-500' : 'text-gray-400'}>None</span>}
                </span>
              </div>
              {dataSelectorState.selectedLayers.length > 0 && (
                <div className={`text-xs pl-1 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {dataSelectorState.selectedLayers.join(', ')}
                </div>
              )}
              <div className="flex justify-between">
                <span className={nightMode ? 'text-gray-400' : 'text-gray-500'}>Tracks loaded</span>
                <span className="font-semibold">
                  {selectedTracks.length > 0
                    ? `${selectedTracks.length} track${selectedTracks.length > 1 ? 's' : ''}`
                    : <span className={nightMode ? 'text-gray-500' : 'text-gray-400'}>None</span>}
                </span>
              </div>
            </div>

            <p className={`text-sm mb-5 ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This will clear all selections and return you to the Sample tab. This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${nightMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
