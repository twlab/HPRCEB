import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ScatterController,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(ScatterController, LinearScale, PointElement, LineElement, Tooltip, Legend, zoomPlugin);

interface PCAPlotProps {
  selectedGenomes?: string[];
  nightMode?: boolean;
}

interface PCAPoint {
  x: number;
  y: number;
  id?: string;
  sample_id?: string;
  super_population?: string;
}

interface SampleMetadata {
  sample_id: string;
  super_population: string;
}

// Population colors matching WorldMap - colorblind-friendly palette
const POPULATION_COLORS: Record<string, string> = {
  'afr': '#f59e0b',  // amber
  'eur': '#3e5b95',  // academic blue rgb(62, 91, 149)
  'sas': '#8b5cf6',  // violet
  'eas': '#ec4899',  // pink
  'amr': '#10b981',  // emerald
};

const POPULATION_NAMES: Record<string, string> = {
  'afr': 'Africa',
  'eur': 'Europe',
  'sas': 'South Asia',
  'eas': 'East Asia',
  'amr': 'Americas',
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export default function PCAPlot({ selectedGenomes = [], nightMode = false }: PCAPlotProps) {
  const [backgroundData, setBackgroundData] = useState<PCAPoint[]>([]);
  const [hprcData, setHprcData] = useState<PCAPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const handleResetZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resetZoom();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load background data
        const bgResponse = await fetch('./data/pca_background.tsv');
        if (!bgResponse.ok) throw new Error('Failed to load background data');
        const bgText = await bgResponse.text();
        const bgLines = bgText.trim().split('\n');
        const bgDataParsed: PCAPoint[] = bgLines.slice(1).map(line => {
          const [id, x, y] = line.split('\t');
          return { id, x: parseFloat(x), y: parseFloat(y) };
        });

        // Load sample metadata to get super populations
        const samplesResponse = await fetch('./data/samples.tsv');
        if (!samplesResponse.ok) throw new Error('Failed to load sample metadata');
        const samplesText = await samplesResponse.text();
        const samplesLines = samplesText.trim().split('\n');
        const sampleMetadata: Record<string, string> = {};
        samplesLines.slice(1).forEach(line => {
          const parts = line.split('\t');
          const sample_id = parts[0];
          const super_population = parts[parts.length - 3]; // super_population is third from the end
          if (super_population) {
            sampleMetadata[sample_id] = super_population;
          }
        });

        // Load HPRC data
        const hprcResponse = await fetch('./data/pca_hprc.tsv');
        if (!hprcResponse.ok) throw new Error('Failed to load HPRC data');
        const hprcText = await hprcResponse.text();
        const hprcLines = hprcText.trim().split('\n');
        const hprcDataParsed: PCAPoint[] = hprcLines.slice(1).map(line => {
          const [sample_id, x, y] = line.split('\t');
          return { 
            sample_id, 
            x: parseFloat(x), 
            y: parseFloat(y),
            super_population: sampleMetadata[sample_id] || ''
          };
        });

        setBackgroundData(bgDataParsed);
        setHprcData(hprcDataParsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || loading || error) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Group HPRC data by population and selection status
    const datasets: any[] = [];

    // Background dataset
    datasets.push({
      label: '1000 Genomes',
      data: backgroundData,
      backgroundColor: nightMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(209, 213, 219, 0.5)',
      pointRadius: 1,
      pointHoverRadius: 2,
      order: 999, // Render first (behind)
    });

    // Create datasets for each population
    const populations = ['afr', 'eur', 'sas', 'eas', 'amr'];
    
    populations.forEach(pop => {
      // Selected samples for this population
      const selectedData = hprcData.filter(
        point => point.super_population === pop && selectedGenomes.includes(point.sample_id || '')
      );
      
      // Unselected samples for this population
      const unselectedData = hprcData.filter(
        point => point.super_population === pop && !selectedGenomes.includes(point.sample_id || '')
      );

      const color = POPULATION_COLORS[pop];
      const rgb = hexToRgb(color);
      
      // Combine both selected and unselected into one dataset with different sizes/opacity
      const allData = [
        ...unselectedData.map(d => ({ ...d, isSelected: false })),
        ...selectedData.map(d => ({ ...d, isSelected: true }))
      ];

      if (allData.length > 0) {
        datasets.push({
          label: POPULATION_NAMES[pop],
          data: allData,
          backgroundColor: (context: any) => {
            const point = context.raw as any;
            return point.isSelected ? color : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
          },
          pointRadius: (context: any) => {
            const point = context.raw as any;
            return point.isSelected ? 6 : 3;
          },
          pointHoverRadius: (context: any) => {
            const point = context.raw as any;
            return point.isSelected ? 8 : 5;
          },
          pointStyle: 'triangle',
          order: 1,
        });
      }
    });

    const chartData = { datasets };

    const options: ChartOptions<'scatter'> = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: nightMode ? '#e5e7eb' : '#374151',
            font: {
              size: 12,
              weight: 'bold',
            },
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const point = context.raw as PCAPoint;
              const label = point.sample_id || point.id || '';
              return `${label} (${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
            },
          },
          backgroundColor: nightMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: nightMode ? '#e5e7eb' : '#1f2937',
          bodyColor: nightMode ? '#d1d5db' : '#374151',
          borderColor: nightMode ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1,
            },
            pinch: {
              enabled: true,
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            mode: 'xy',
          },
          limits: {
            x: { min: -0.5, max: 0.5 },
            y: { min: -0.5, max: 0.5 },
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          position: 'bottom' as const,
          title: {
            display: true,
            text: 'Principal component 1',
            color: nightMode ? '#d1d5db' : '#374151',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            color: nightMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
          },
          ticks: {
            color: nightMode ? '#9ca3af' : '#6b7280',
          },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Principal component 2',
            color: nightMode ? '#d1d5db' : '#374151',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            color: nightMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
          },
          ticks: {
            color: nightMode ? '#9ca3af' : '#6b7280',
          },
        },
      },
    };

    // Create new chart
    chartInstanceRef.current = new ChartJS(chartRef.current, {
      type: 'scatter',
      data: chartData,
      options: options,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [backgroundData, hprcData, loading, error, nightMode, selectedGenomes]);

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Principal Component Analysis
          </h2>
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
            Genetic diversity visualization
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className={`mt-4 text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading PCA data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className={`rounded-lg p-4 ${nightMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className={`text-sm font-medium ${nightMode ? 'text-red-300' : 'text-red-800'}`}>
              Error loading PCA data: {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className={`rounded-xl p-4 ${nightMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          {/* Interactive Controls */}
          <div className={`flex items-center justify-between mb-3 pb-3 border-b ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>🖱️ Scroll to zoom • Drag to pan</span>
              </div>
            </div>
            <button
              onClick={handleResetZoom}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                nightMode 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              Reset Zoom
            </button>
          </div>

          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
}

