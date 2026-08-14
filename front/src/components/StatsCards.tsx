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
      <div className={`${nightMode ? 'bg-gray-800 border-primary-700' : 'bg-white border-primary-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`}>
        <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total Samples</p>
        <p className={`text-3xl font-extrabold ${nightMode ? 'text-primary-300' : 'text-primary-600'} mt-2`}>{totalGenomes}</p>
      </div>

      <div className={`${nightMode ? 'bg-gray-800 border-primary-700' : 'bg-white border-primary-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.1s' }}>
        <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Selected</p>
        <p className={`text-3xl font-extrabold ${nightMode ? 'text-primary-300' : 'text-primary-600'} mt-2`}>{selectedGenomes}</p>
      </div>

      <div className={`${nightMode ? 'bg-gray-800 border-primary-700' : 'bg-white border-primary-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.2s' }}>
        <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Data Layers</p>
        <p className={`text-3xl font-extrabold ${nightMode ? 'text-primary-300' : 'text-primary-600'} mt-2`}>{dataLayers}</p>
      </div>

      <div className={`${nightMode ? 'bg-gray-800 border-primary-700' : 'bg-white border-primary-100'} rounded-2xl shadow-fancy border p-6 stat-card hover-lift animate-fade-in-up transition-colors duration-300`} style={{ animationDelay: '0.3s' }}>
        <p className={`text-xs font-semibold ${nightMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total Size</p>
        <p className={`text-3xl font-extrabold ${nightMode ? 'text-primary-300' : 'text-primary-600'} mt-2`}>{totalSize.toFixed(1)} GB</p>
      </div>
    </div>
  );
}
