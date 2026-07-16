import { ArrowDownTrayIcon, CheckIcon, CircleStackIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface StatsCardsProps {
  totalGenomes: number;
  selectedGenomes: number;
  dataLayers: number;
  totalSize: number;
  nightMode?: boolean;
}

export default function StatsCards({ totalGenomes, selectedGenomes, dataLayers, totalSize, nightMode = false }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className={`${nightMode ? 'bg-gray-800 border-sky-700' : 'bg-white border-sky-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total Samples</p>
            <p className={`text-3xl font-extrabold ${nightMode ? 'text-sky-400' : 'text-sky-600'} mt-2`}>{totalGenomes}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <DocumentTextIcon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      <div className={`${nightMode ? 'bg-gray-800 border-sky-700' : 'bg-white border-sky-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Selected</p>
            <p className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent mt-2">{selectedGenomes}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow transform rotate-3 hover:rotate-0 transition-transform">
            <CheckIcon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className={`${nightMode ? 'bg-gray-800 border-sky-700' : 'bg-white border-sky-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Data Layers</p>
            <p className={`text-3xl font-extrabold ${nightMode ? 'text-sky-400' : 'text-sky-600'} mt-2`}>{dataLayers}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
            <CircleStackIcon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className={`${nightMode ? 'bg-gray-800 border-sky-700' : 'bg-white border-sky-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total Size</p>
            <p className={`text-3xl font-extrabold ${nightMode ? 'text-sky-400' : 'text-sky-600'} mt-2`}>{totalSize.toFixed(1)} GB</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform">
            <ArrowDownTrayIcon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}


