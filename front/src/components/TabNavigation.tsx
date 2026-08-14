export type TabType = 'availability-matrix' | 'sample' | 'tracks' | 'browser' | 'tutorials' | 'sessions' | 'about';

interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  nightMode?: boolean;
}

export const TABS: { id: TabType; label: string }[] = [
  { id: 'sample', label: 'Sample' },
  { id: 'tracks', label: 'Track' },
  { id: 'browser', label: 'Browser' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'availability-matrix', label: 'Data Availability' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'about', label: 'About' },
];

export default function TabNavigation({ currentTab, onTabChange, nightMode = false }: TabNavigationProps) {
  return (
    <nav
      data-tour="tabs"
      aria-label="Main sections"
      className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-40 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Narrow screens wrap into a grid so every tab is reachable without
            horizontal scrolling; sm and up keeps the single tab strip. */}
        <div className="grid grid-cols-4 sm:flex sm:overflow-x-auto sm:scrollbar-thin">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              /* Stable hook for the guided tour. Positional selectors broke
                 every time a tab was added or reordered. */
              data-tour={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={currentTab === tab.id ? 'page' : undefined}
              className={`px-2 py-2.5 text-xs leading-tight sm:flex-1 sm:min-w-fit sm:px-4 sm:py-4 sm:text-sm sm:whitespace-nowrap font-semibold border-b-2 transition-colors ${
                currentTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : nightMode
                    ? 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}


