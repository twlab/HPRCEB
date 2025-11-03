type TabType = 'availability-matrix' | 'data-selector' | 'browser' | 'tutorials' | 'sessions';

interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  nightMode?: boolean;
}

export default function TabNavigation({ currentTab, onTabChange, nightMode = false }: TabNavigationProps) {
  const tabs = [
    { id: 'data-selector' as TabType, label: 'Data Selector' },
    { id: 'browser' as TabType, label: 'Browser' },
    { id: 'sessions' as TabType, label: 'Sessions' },
    { id: 'availability-matrix' as TabType, label: 'Data Availability Matrix' },
    { id: 'tutorials' as TabType, label: 'Tutorials' },
  ];

  return (
    <nav className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-40 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
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


