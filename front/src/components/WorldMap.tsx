import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import type { Population } from '../utils/genomeTypes';
import { getGenomeData } from '../utils/genomeDataService';

interface WorldMapProps {
  selectedPopulation: Population;
  populationCounts: Record<string, number>;
  selectedGenomes?: string[];
  onPopulationClick: (population: Population) => void;
  nightMode?: boolean;
}

// Using Natural Earth's world map data (110m resolution - lower detail, smaller file)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Population region definitions with approximate center coordinates and zoom settings
const populationRegions = [
  {
    id: 'afr' as Population,
    name: 'Africa',
    abbr: 'AFR',
    color: '#f59e0b', // amber
    hoverColor: '#d97706',
    coordinates: [20, 0] as [number, number], // Longitude, Latitude for label
    zoom: { scale: 350, center: [20, 5] as [number, number] }, // Zoom settings
    // ISO country codes that belong to this region (for highlighting)
    countries: ['DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV', 'CAF', 'TCD', 
                'COM', 'COG', 'COD', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'ETH', 'GAB',
                'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI',
                'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP',
                'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'SWZ', 'TZA', 'TGO',
                'TUN', 'UGA', 'ZMB', 'ZWE'],
  },
  {
    id: 'eur' as Population,
    name: 'Europe',
    abbr: 'EUR',
    color: '#3e5b95', // academic blue rgb(62, 91, 149)
    hoverColor: '#344c7a',
    coordinates: [15, 54] as [number, number],
    zoom: { scale: 450, center: [15, 54] as [number, number] },
    countries: ['ALB', 'AND', 'AUT', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE',
                'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA',
                'XKX', 'LVA', 'LIE', 'LTU', 'LUX', 'MKD', 'MLT', 'MDA', 'MCO', 'MNE',
                'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'RUS', 'SMR', 'SRB', 'SVK', 'SVN',
                'ESP', 'SWE', 'CHE', 'UKR', 'GBR', 'VAT'],
  },
  {
    id: 'sas' as Population,
    name: 'South Asia',
    abbr: 'SAS',
    color: '#8b5cf6', // violet
    hoverColor: '#7c3aed',
    coordinates: [78, 22] as [number, number],
    zoom: { scale: 500, center: [78, 22] as [number, number] },
    countries: ['AFG', 'BGD', 'BTN', 'IND', 'MDV', 'NPL', 'PAK', 'LKA'],
  },
  {
    id: 'eas' as Population,
    name: 'East Asia',
    abbr: 'EAS',
    color: '#ec4899', // pink
    hoverColor: '#db2777',
    coordinates: [110, 35] as [number, number],
    zoom: { scale: 400, center: [110, 35] as [number, number] },
    countries: ['CHN', 'HKG', 'JPN', 'MAC', 'MNG', 'PRK', 'KOR', 'TWN'],
  },
  {
    id: 'amr' as Population,
    name: 'Americas',
    abbr: 'AMR',
    color: '#10b981', // emerald
    hoverColor: '#059669',
    coordinates: [-95, 20] as [number, number],
    zoom: { scale: 250, center: [-80, 5] as [number, number] },
    countries: ['ATG', 'ARG', 'BHS', 'BRB', 'BLZ', 'BOL', 'BRA', 'CAN', 'CHL', 'COL',
                'CRI', 'CUB', 'DMA', 'DOM', 'ECU', 'SLV', 'GRD', 'GTM', 'GUY', 'HTI',
                'HND', 'JAM', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'KNA', 'LCA', 'VCT',
                'SUR', 'TTO', 'USA', 'URY', 'VEN'],
  },
];

export default function WorldMap({ selectedPopulation, populationCounts, selectedGenomes = [], onPopulationClick, nightMode = false }: WorldMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Get zoom settings based on selected population
  const getZoomSettings = () => {
    if (selectedPopulation === 'all') {
      return { scale: 140, center: [0, 0] as [number, number] };
    }
    const region = populationRegions.find(r => r.id === selectedPopulation);
    return region ? region.zoom : { scale: 140, center: [0, 0] as [number, number] };
  };

  const zoomSettings = getZoomSettings();

  // Calculate selected counts per population
  const getSelectedCounts = () => {
    const counts: Record<string, number> = {};
    const genomeData = getGenomeData();
    
    // Initialize counts
    populationRegions.forEach(region => {
      counts[region.id] = 0;
    });
    
    // Count selected genomes by population
    selectedGenomes.forEach(genomeId => {
      const genome = genomeData.find(g => g.id === genomeId);
      if (genome && counts.hasOwnProperty(genome.population)) {
        counts[genome.population]++;
      }
    });
    
    return counts;
  };

  const selectedCounts = getSelectedCounts();
  const isZoomedIn = selectedPopulation !== 'all';

  // Get samples with valid coordinates for the selected population
  const getSamplesWithCoordinates = () => {
    const genomeData = getGenomeData();
    return genomeData.filter(genome => {
      // Check if sample has valid coordinates
      const hasCoords = genome.longitude && genome.latitude && 
                       genome.longitude !== '' && genome.latitude !== '' &&
                       genome.longitude !== 'N/A' && genome.latitude !== 'N/A';
      
      if (!hasCoords) return false;
      
      // If zoomed in, only show samples from the selected population
      if (isZoomedIn) {
        const genomePopulation = genome.super_population || genome.population;
        return genomePopulation === selectedPopulation;
      }
      
      return true;
    });
  };

  const samplesWithCoords = getSamplesWithCoordinates();

  const getCountryColor = (geo: any) => {
    const isoCode = geo.properties.ISO_A3;
    
    for (const region of populationRegions) {
      if (region.countries.includes(isoCode)) {
        const isHovered = hoveredRegion === region.id;
        
        if (isHovered) {
          return region.hoverColor;
        }
        
        return region.color;
      }
    }
    
    // Countries not in any population group (e.g., Middle East, Southeast Asia, Oceania)
    return nightMode ? '#1f2937' : '#e5e7eb'; // Darker gray in night mode for better contrast
  };

  const getCountryOpacity = (geo: any) => {
    const isoCode = geo.properties.ISO_A3;
    
    // Always show colors at full opacity for visibility
    if (selectedPopulation === 'all') {
      return 1;
    }
    
    for (const region of populationRegions) {
      if (region.countries.includes(isoCode)) {
        return selectedPopulation === region.id ? 1 : 0.6; // Increased opacity for better visibility
      }
    }
    
    return 0.4; // Increased opacity for non-population countries
  };

  const getRegionForCountry = (geo: any) => {
    const isoCode = geo.properties.ISO_A3;
    return populationRegions.find(region => region.countries.includes(isoCode));
  };

  return (
    <div className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-fancy border p-6 hover-lift transition-colors duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-primary-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>Geolocation Distribution</h2>
      </div>

      {/* Map */}
      <div className={`relative ${nightMode ? 'bg-gradient-to-br from-primary-900/30 to-cyan-900/30 border-primary-700' : 'bg-gradient-to-br from-primary-50 to-cyan-50 border-primary-100'} rounded-xl overflow-hidden border`}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: zoomSettings.scale,
            center: zoomSettings.center,
          }}
          width={900}
          height={400}
          style={{
            width: '100%',
            height: 'auto',
            transition: 'all 0.5s ease-in-out',
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const region = getRegionForCountry(geo);
                
                const countryColor = getCountryColor(geo);
                const countryOpacity = getCountryOpacity(geo);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: countryColor,
                        opacity: countryOpacity,
                        outline: 'none',
                        stroke: nightMode ? '#0f172a' : '#ffffff',
                        strokeWidth: 0.75,
                        transition: 'all 0.2s',
                      },
                      hover: {
                        fill: region ? region.hoverColor : countryColor,
                        opacity: 1,
                        outline: 'none',
                        stroke: nightMode ? '#000000' : '#1f2937',
                        strokeWidth: 1.5,
                      },
                      pressed: {
                        fill: countryColor,
                        opacity: 1,
                        outline: 'none',
                        stroke: nightMode ? '#0f172a' : '#ffffff',
                        strokeWidth: 0.75,
                      },
                    }}
                    onMouseEnter={() => {
                      if (region) {
                        setHoveredRegion(region.id);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredRegion(null);
                    }}
                    onClick={() => {
                      if (region) {
                        onPopulationClick(region.id);
                      }
                    }}
                    className={region ? 'cursor-pointer' : ''}
                  />
                );
              })
            }
          </Geographies>
          
          {/* Region labels with counts */}
          {populationRegions.map((region) => {
            const totalCount = populationCounts[region.id] || 0;
            const selectedCount = selectedCounts[region.id] || 0;
            if (totalCount === 0) return null;
            
            // Show selected/total when not zoomed in, just total when zoomed in
            const displayText = isZoomedIn ? totalCount.toString() : `${selectedCount}/${totalCount}`;
            const badgeWidth = isZoomedIn ? 20 : 35; // Wider badge for selected/total format
            
            return (
              <Marker key={region.id} coordinates={region.coordinates}>
                <g className="pointer-events-none">
                  {/* Label background */}
                  <rect
                    x={-25}
                    y={-12}
                    width={50}
                    height={24}
                    rx={4}
                    fill={nightMode ? '#1f2937' : 'white'}
                    opacity={0.95}
                    stroke={region.color}
                    strokeWidth={2}
                  />
                  {/* Abbreviation */}
                  <text
                    textAnchor="middle"
                    y={3}
                    style={{
                      fontFamily: 'system-ui',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      fill: region.color,
                    }}
                  >
                    {region.abbr}
                  </text>
                  {/* Count badge */}
                  <rect
                    x={30 - badgeWidth/2}
                    y={-10}
                    width={badgeWidth}
                    height={16}
                    rx={8}
                    fill={region.color}
                  />
                  <text
                    x={30}
                    y={0}
                    textAnchor="middle"
                    style={{
                      fontFamily: 'system-ui',
                      fontSize: isZoomedIn ? '10px' : '8px',
                      fontWeight: 'bold',
                      fill: 'white',
                    }}
                  >
                    {displayText}
                  </text>
                </g>
              </Marker>
            );
          })}

          {/* Individual sample markers when zoomed in */}
          {isZoomedIn && samplesWithCoords.map((genome) => {
            const longitude = parseFloat(genome.longitude || '0');
            const latitude = parseFloat(genome.latitude || '0');
            
            // Add random offset to prevent overlapping (consistent per sample ID)
            const seed = genome.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
            const offsetLng = (random1 - 0.5) * 4; // ±2 degrees
            const offsetLat = (random2 - 0.5) * 2; // ±1 degree
            
            const adjustedLng = longitude + offsetLng;
            const adjustedLat = latitude + offsetLat;
            
            const isSelected = selectedGenomes.includes(genome.id);
            const populationCode = genome.population_abbreviation || genome.super_population || genome.population;
            
            // Get region color for this sample
            const genomePopulation = genome.super_population || genome.population;
            const region = populationRegions.find(r => r.id === genomePopulation);
            const markerColor = region ? region.color : '#6b7280';
            
            return (
              <Marker key={genome.id} coordinates={[adjustedLng, adjustedLat]}>
                <g className="cursor-pointer hover:opacity-80 transition-opacity">
                  {/* Sample marker circle */}
                  <circle
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? markerColor : (nightMode ? '#374151' : 'white')}
                    stroke={markerColor}
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={isSelected ? 0.9 : 0.5}
                  />
                  {/* Inner dot for selected samples */}
                  {isSelected && (
                    <circle
                      r={2}
                      fill="white"
                      opacity={1}
                    />
                  )}
                  {/* Tooltip on hover */}
                  <title>
                    {genome.id} ({populationCode})
                    {genome.paternal_id && genome.maternal_id && 
                      `\nParents: ♂${genome.paternal_id} ♀${genome.maternal_id}`}
                  </title>
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className={`mt-4 pt-4 border-t ${nightMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-3 justify-center">
          {populationRegions.map((region) => {
            const count = populationCounts[region.id] || 0;
            const isActive = selectedPopulation === region.id || selectedPopulation === 'all';
            
            return (
              <button
                key={region.id}
                onClick={() => onPopulationClick(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  isActive 
                    ? nightMode
                      ? 'border-gray-500 bg-gray-700 shadow-md'
                      : 'border-gray-300 bg-white shadow-md'
                    : nightMode
                      ? 'border-transparent bg-gray-700/50 opacity-60 hover:opacity-100'
                      : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: region.color }}
                />
                <span className={`text-sm font-medium ${nightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {region.abbr}
                </span>
                <span className={`text-xs font-bold ${nightMode ? 'text-gray-100 bg-gray-600' : 'text-gray-900 bg-gray-100'} px-2 py-0.5 rounded-full`}>
                  {count}
                </span>
              </button>
            );
          })}
          
          {/* All populations button */}
          <button
            onClick={() => onPopulationClick('all')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedPopulation === 'all' 
                ? nightMode
                  ? 'border-gray-500 bg-gray-700 shadow-md'
                  : 'border-gray-400 bg-gradient-to-r from-gray-100 to-gray-50 shadow-md'
                : nightMode
                  ? 'border-transparent bg-gray-700/50 opacity-60 hover:opacity-100'
                  : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="w-4 h-4 rounded bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
            <span className={`text-sm font-bold ${nightMode ? 'text-gray-200' : 'text-gray-700'}`}>
              All
            </span>
            <span className={`text-xs font-bold ${nightMode ? 'text-gray-100 bg-gray-600' : 'text-gray-900 bg-gray-100'} px-2 py-0.5 rounded-full`}>
              {Object.values(populationCounts).reduce((a, b) => a + b, 0)}
            </span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
          Click on a region or legend item to filter genomes by population
          {isZoomedIn && samplesWithCoords.length > 0 && (
            <span className="block mt-1">
              Individual samples shown as dots • Selected samples are highlighted
              <span className={`block mt-1 ${nightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Note: Sample locations are for illustration purposes only and do not represent exact geographic accuracy
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
