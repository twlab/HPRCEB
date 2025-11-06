import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import DataAvailabilityMatrix from './components/DataAvailabilityMatrix';
import DataSelector, { DataSelectorState } from './components/DataSelector';
import Browser from './components/Browser';
import Tutorials from './components/Tutorials';
import Sessions from './components/Sessions';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InteractiveTutorial from './components/InteractiveTutorial';
import { loadGenomeData } from './utils/genomeDataService';
import { getCookie, deleteCookie } from './utils/cookieUtils';
import './style.css';

type TabType = 'availability-matrix' | 'data-selector' | 'browser' | 'tutorials' | 'sessions';

function App() {
  // Check if user wants to skip landing page
  const skipLanding = getCookie('hprc_skip_landing') === 'true';
  const [showLanding, setShowLanding] = useState(!skipLanding);
  
  // Get initial tab from URL parameter
  const getInitialTab = (): TabType => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const validTabs: TabType[] = ['availability-matrix', 'data-selector', 'browser', 'tutorials', 'sessions'];
    if (tabParam && validTabs.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return 'data-selector';
  };
  
  const [currentTab, setCurrentTab] = useState<TabType>(getInitialTab());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(false);
  
  // Tutorial state
  const tutorialCompleted = localStorage.getItem('hprc_tutorial_completed') === 'true';
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialTriggerRequested, setTutorialTriggerRequested] = useState(false);
  
  // Shared state for DataSelector and Browser
  const [dataSelectorState, setDataSelectorState] = useState<DataSelectorState>({
    selectedGenomes: [],
    selectedLayers: [],
    searchTerm: '',
    populationFilter: 'all',
    referenceGenome: 'hg38',
  });

  // Load genome data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await loadGenomeData();
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load genome data:', err);
        setError('Failed to load genome data. Please refresh the page or contact support.');
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
        setShowTutorial(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [showLanding, tutorialCompleted, isLoading, error]);

  // Handle tutorial restart request (kept for future use)
  useEffect(() => {
    if (tutorialTriggerRequested && !showLanding && !isLoading && !error) {
      setTutorialTriggerRequested(false);
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tutorialTriggerRequested, showLanding, isLoading, error]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', currentTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ tab: currentTab }, '', newUrl);
  }, [currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setCurrentTab(event.state.tab);
      } else {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
          setCurrentTab(tabParam as TabType);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handlers for session management
  const handleLoadSession = (state: DataSelectorState, tab?: string) => {
    setDataSelectorState(state);
    if (tab && tab !== 'sessions') {
      setCurrentTab(tab as TabType);
    }
  };

  const handleResetLandingPage = () => {
    // This just confirms the reset - the actual effect happens on next page load
    // We could force showing the landing page here, but it might confuse the user
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
    setShowTutorial(true);
  };

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className={`fixed inset-0 ${nightMode ? 'bg-gray-950' : 'bg-gray-900'} bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`${nightMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'} rounded-lg p-8 max-w-sm`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-center">Loading genome data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-start">
          <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
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
    <div className={`${nightMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'} min-h-screen flex flex-col transition-colors duration-300`}>
      {/* Interactive Tutorial Overlay */}
      {showTutorial && (
        <InteractiveTutorial
          nightMode={nightMode}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          onTabChange={setCurrentTab}
        />
      )}

      <Header nightMode={nightMode} onToggleNightMode={() => setNightMode(!nightMode)} />
      <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} nightMode={nightMode} />
      
      {/* Browser tab uses full width, other tabs use max-width constraint */}
      {currentTab === 'browser' ? (
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Browser 
            selectedGenomes={dataSelectorState.selectedGenomes}
            selectedLayers={dataSelectorState.selectedLayers}
            referenceGenome={dataSelectorState.referenceGenome}
            nightMode={nightMode}
          />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {currentTab === 'availability-matrix' && <DataAvailabilityMatrix nightMode={nightMode} />}
          {currentTab === 'data-selector' && (
            <DataSelector 
              state={dataSelectorState} 
              onStateChange={setDataSelectorState}
              nightMode={nightMode}
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
              currentTab={currentTab}
              onLoadSession={handleLoadSession}
              onResetLandingPage={handleResetLandingPage}
              nightMode={nightMode}
            />
          )}
        </main>
      )}

      <Footer nightMode={nightMode} />
    </div>
  );
}

export default App;

