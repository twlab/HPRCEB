// Portal Configuration
// Customize these settings for your deployment

interface DataSourceConfig {
  type: 'static' | 'api' | 's3';
  jsonUrl?: string;
  apiBaseUrl?: string;
  s3Config?: {
    region: string;
    bucket: string;
  };
}

interface FeatureFlags {
  enableExport: boolean;
  enableChartView: boolean;
  enableTableView: boolean;
  enableMetadataModal: boolean;
  enableDownloadLinks: boolean;
  enablePopulationFilter: boolean;
}

interface UIConfig {
  defaultView: 'table' | 'chart';
  itemsPerPage: number;
  enableAnimations: boolean;
  showQualityBadges: boolean;
}

interface DataLayerConfig {
  enabled: boolean;
  label: string;
  description: string;
  type: string;
  color: string;
  avgSize: number;
}

interface PopulationConfig {
  label: string;
  enabled: boolean;
}

interface AnalyticsConfig {
  enabled: boolean;
  googleAnalyticsId?: string;
}

interface DownloadConfig {
  enableBulkDownload: boolean;
  maxConcurrentDownloads: number;
  urlExpirationHours: number;
}

interface CacheConfig {
  enabled: boolean;
  ttlMinutes: number;
}

interface Config {
  title: string;
  subtitle: string;
  links: {
    hprcWebsite: string;
    documentation: string;
    support: string;
  };
  dataSource: DataSourceConfig;
  features: FeatureFlags;
  ui: UIConfig;
  dataLayers: Record<string, DataLayerConfig>;
  populations: Record<string, PopulationConfig>;
  analytics: AnalyticsConfig;
  download: DownloadConfig;
  cache: CacheConfig;
}

export const config: Config = {
  // Portal metadata
  title: "HPRC Epigenome Browser",
  subtitle: "Human Pangenome Reference Consortium - Epigenome Data Browser",
  
  // External links
  links: {
    hprcWebsite: "https://humanpangenome.org",
    documentation: "#",
    support: "#",
  },

  // Data source configuration
  dataSource: {
    type: "static", // "static", "api", or "s3"
    // For static JSON file
    jsonUrl: "/data/genomes.json",
    // For API
    apiBaseUrl: "https://api.hprc.org/v1",
    // For S3
    s3Config: {
      region: "us-west-2",
      bucket: "hprc-y2-data",
    },
  },

  // Feature flags
  features: {
    enableExport: true,
    enableChartView: true,
    enableTableView: true,
    enableMetadataModal: true,
    enableDownloadLinks: true,
    enablePopulationFilter: true,
  },

  // UI customization
  ui: {
    defaultView: "table", // "table" or "chart"
    itemsPerPage: 20,
    enableAnimations: true,
    showQualityBadges: true,
  },

  // Data layer configuration
  dataLayers: {
    methylation: {
      enabled: true,
      label: "DNA Methylation",
      description: "Whole genome bisulfite sequencing data for CpG methylation profiling",
      type: "WGBS",
      color: "#06b6d4", // Vibrant cyan - colorblind-friendly
      avgSize: 15,
    },
    expression: {
      enabled: true,
      label: "Expression",
      description: "RNA sequencing data for gene expression quantification",
      type: "RNA-seq",
      color: "#10b981", // Green - colorblind-friendly
      avgSize: 8,
    },
    fiberseq: {
      enabled: true,
      label: "Fiber-seq",
      description: "Single-molecule chromatin accessibility and nucleosome positioning",
      type: "PacBio",
      color: "#f97316", // Orange - colorblind-friendly
      avgSize: 20,
    },
  },

  // Population configuration
  populations: {
    all: { label: "All Populations", enabled: true },
    afr: { label: "African", enabled: true },
    amr: { label: "American", enabled: true },
    eas: { label: "East Asian", enabled: true },
    eur: { label: "European", enabled: true },
    sas: { label: "South Asian", enabled: true },
  },

  // Analytics (optional)
  analytics: {
    enabled: false,
    googleAnalyticsId: "G-XXXXXXXXXX",
  },

  // Download settings
  download: {
    enableBulkDownload: true,
    maxConcurrentDownloads: 3,
    urlExpirationHours: 24,
  },

  // Cache settings
  cache: {
    enabled: true,
    ttlMinutes: 60,
  },
};

export default config;

