// Assembly utilities for loading and converting assembly tracks
import type { Genome, Track, DataLayer } from './genomeTypes';
import type { TracksProps } from './browserTypes';

/**
 * Convert a Track object to TracksProps format for the browser
 */
export function convertTrackToTracksProps(track: Track, sampleId: string): TracksProps {
  const browserAttrs = track.browserAttributes || {};
  const dataAttrs = track.dataAttributes || {};
  const haplotype = browserAttrs.haplotype || track.haplotype || 'combined';
  
  // Create querygenome name in format: sampleID_mat/pat
  const querygenome = `${sampleId}_${haplotype}`;
  
  return {
    name: browserAttrs.track_name || track.trackName || `${sampleId} Assembly (${haplotype})`,
    type: "genomealign", // Assembly tracks are displayed as genome alignments
    querygenome: querygenome, // Move querygenome to top level
    url: browserAttrs.url || track.downloadUrl,
    showOnHubLoad: true,
    metadata: {
      genome: browserAttrs.reference_genome || track.referenceGenome, // Only keep reference genome
      dataAttributes: dataAttrs, // Include data attributes for tooltip
    },
    options: {
      label: browserAttrs.track_name || track.trackName,
      // Add any additional options for assembly visualization
    }
  };
}

/**
 * Map UI reference genome values to data reference genome values
 */
function mapReferenceGenome(uiReferenceGenome: string): string {
  const mapping: Record<string, string> = {
    'hg38': 'hg38',
    't2t-chm13-v2.0': 'chm13',  // Map UI value to data value
    'chm13': 'chm13',           // Also support direct chm13
  };
  return mapping[uiReferenceGenome] || uiReferenceGenome;
}

/**
 * Get assembly tracks for selected genomes filtered by reference genome
 * Organized by haplotype: maternal tracks after maternal assembly tracks,
 * paternal tracks after paternal assembly tracks
 */
export function getAssemblyTracksForGenomes(
  genomes: Genome[], 
  selectedGenomeIds: string[], 
  referenceGenome: string
): TracksProps[] {
  const assemblyTracks: TracksProps[] = [];
  
  // Map UI reference genome to data reference genome
  const dataReferenceGenome = mapReferenceGenome(referenceGenome);
  
  selectedGenomeIds.forEach(genomeId => {
    const genome = genomes.find(g => g.id === genomeId);
    if (!genome) return;
    
    // Get assembly tracks for this genome
    const tracks = genome.assemblyTracks || (genome.assemblyTrack ? [genome.assemblyTrack] : []);
    
    // Filter by reference genome (using mapped value)
    const filteredTracks = tracks.filter(track => {
      const browserAttrs = track.browserAttributes || {};
      const trackRefGenome = browserAttrs.reference_genome || track.referenceGenome;
      return trackRefGenome === dataReferenceGenome;
    });
    
    // Organize tracks by haplotype
    const maternalTracks: TracksProps[] = [];
    const paternalTracks: TracksProps[] = [];
    const combinedTracks: TracksProps[] = [];
    
    filteredTracks.forEach(track => {
      const browserAttrs = track.browserAttributes || {};
      const haplotype = browserAttrs.haplotype || track.haplotype || 'combined';
      const convertedTrack = convertTrackToTracksProps(track, genomeId);
      
      if (haplotype === 'mat') {
        maternalTracks.push(convertedTrack);
      } else if (haplotype === 'pat') {
        paternalTracks.push(convertedTrack);
      } else {
        combinedTracks.push(convertedTrack);
      }
    });
    
    // Add tracks in order: maternal first, then paternal, then combined
    assemblyTracks.push(...maternalTracks);
    assemblyTracks.push(...paternalTracks);
    assemblyTracks.push(...combinedTracks);
  });
  
  return assemblyTracks;
}

/**
 * Convert a data track (methylation, expression, etc.) to TracksProps format for the browser
 */
export function convertDataTrackToTracksProps(track: Track, sampleId: string): TracksProps {
  const browserAttrs = track.browserAttributes || {};
  const dataAttrs = track.dataAttributes || {};
  const haplotype = browserAttrs.haplotype || track.haplotype || 'combined';
  
  // Determine track type based on data type and track type
  let trackType = "genomealign"; // default
  if (track.dataType === 'methylation') {
    if (browserAttrs.track_type === 'modbed') {
      trackType = "modbed";
    } else {
      trackType = "methylc";
    }
  } else if (track.dataType === 'expression') {
    // Check if track_type specifies bigwig
    if (browserAttrs.track_type === 'bigwig') {
      trackType = "bigwig";
    } else {
      trackType = "rnaseq";
    }
  } else if (track.dataType === 'chromatin_accessibility') {
    trackType = "bam";
  }
  
  // Create querygenome name in format: sampleID_mat/pat
  const querygenome = `${sampleId}_${haplotype}`;
  
  // Default options for methylc tracks
  const defaultMethylcOptions = {
    height: 40,
    colorsForContext: {
      CG: {
        color: "#3e5b95", // Academic blue rgb(62, 91, 149) for CG context
        background: "#e8ecf4"
      },
      CHG: {
        color: "#f59e0b", // Amber for CHG context - colorblind-friendly
        background: "#fef3c7"
      },
      CHH: {
        color: "#8b5cf6", // Violet for CHH context - colorblind-friendly
        background: "#f3e8ff"
      }
    },
    depthColor: "black",
    isCombineStrands: true
  };
  
  // Default options for bigwig tracks
  const defaultBigwigOptions = {
    height: 50,
  };
  
  // Merge track options
  const trackOptions = {
    label: browserAttrs.track_name || track.trackName,
    ...(trackType === 'methylc' ? defaultMethylcOptions : {}),
    ...(trackType === 'bigwig' ? defaultBigwigOptions : {}),
    ...(browserAttrs.options || {})
  };
  
  // Determine the genome for metadata
  // For tracks on individual haplotype genomes, use querygenome
  // For tracks on reference genome, use reference_genome
  // For tracks without haplotype/reference (like bigwig), leave undefined to use default
  let metadataGenome = browserAttrs.metadata?.genome;
  if (!metadataGenome) {
    if (haplotype && haplotype !== 'combined') {
      metadataGenome = querygenome;
    } else if (browserAttrs.reference_genome) {
      metadataGenome = browserAttrs.reference_genome;
    }
    // If neither haplotype nor reference_genome, metadataGenome remains undefined
  }
  
  // IMPORTANT: Data tracks (methylation, etc.) on query genomes should NOT have querygenome field
  // Only genomealign tracks should have querygenome
  // Data tracks use metadata.genome to specify which genome they're on
  return {
    name: browserAttrs.track_name || track.trackName || `${sampleId} ${track.dataType} (${haplotype})`,
    type: trackType,
    url: browserAttrs.url || track.downloadUrl,
    showOnHubLoad: true,
    metadata: {
      genome: metadataGenome,
      "Track type": trackType,
      dataAttributes: dataAttrs, // Include data attributes for tooltip
      ...browserAttrs.metadata
    },
    options: trackOptions
  };
}

/**
 * Get all data tracks (assembly + other data types) for selected genomes organized by haplotype
 * Filtered by selected data layers
 */
export function getAllTracksForGenomes(
  genomes: Genome[], 
  selectedGenomeIds: string[], 
  referenceGenome: string,
  selectedLayers: DataLayer[] = []
): TracksProps[] {
  const allTracks: TracksProps[] = [];
  
  // Map UI reference genome to data reference genome
  const dataReferenceGenome = mapReferenceGenome(referenceGenome);
  
  selectedGenomeIds.forEach(genomeId => {
    const genome = genomes.find(g => g.id === genomeId);
    if (!genome) return;
    
    // Get all tracks for this genome
    // Assembly tracks are always included
    const assemblyTracks = genome.assemblyTracks || (genome.assemblyTrack ? [genome.assemblyTrack] : []);
    
    // Functional data tracks are only included if their layer is selected
    const methylationTracks = selectedLayers.includes('methylation') 
      ? (genome.methylationTracks || []) 
      : [];
    const expressionTracks = selectedLayers.includes('expression') 
      ? (genome.expressionTracks || []) 
      : [];
    const chromatinTracks = selectedLayers.includes('fiberseq')
      ? (genome.chromatinAccessibilityTracks || genome.fiberseqTracks || []) 
      : [];
    
    const allGenomeTracks = [
      ...assemblyTracks,
      ...methylationTracks,
      ...expressionTracks,
      ...chromatinTracks
    ];
    
    // Filter by reference genome
    // Note: Some tracks (like bigwig) may not have a reference_genome
    // In that case, include them for all reference genomes
    const filteredTracks = allGenomeTracks.filter(track => {
      const browserAttrs = track.browserAttributes || {};
      const trackRefGenome = browserAttrs.reference_genome || track.referenceGenome;
      
      // If track has no reference genome specified, include it for all references
      if (!trackRefGenome) {
        return true;
      }
      
      return trackRefGenome === dataReferenceGenome;
    });
    
    // Organize tracks by coordinate system
    // Order: reference coords -> mat align -> mat coords -> pat align -> pat coords
    const referenceCoordTracks: TracksProps[] = [];      // Tracks on reference coordinates (e.g., bigwig without haplotype)
    const maternalAssemblyTracks: TracksProps[] = [];    // mat/hap1 genome alignment
    const maternalCoordTracks: TracksProps[] = [];       // Tracks using mat/hap1 coordinates
    const paternalAssemblyTracks: TracksProps[] = [];    // pat/hap2 genome alignment
    const paternalCoordTracks: TracksProps[] = [];       // Tracks using pat/hap2 coordinates
    
    filteredTracks.forEach(track => {
      const browserAttrs = track.browserAttributes || {};
      const haplotype = browserAttrs.haplotype || track.haplotype || 'combined';
      const isAssembly = track.dataType === 'assembly';
      
      let convertedTrack: TracksProps;
      if (isAssembly) {
        convertedTrack = convertTrackToTracksProps(track, genomeId);
      } else {
        convertedTrack = convertDataTrackToTracksProps(track, genomeId);
      }
      
      // Organize by coordinate system and haplotype
      if (haplotype === 'mat' || haplotype === 'hap1') {
        if (isAssembly) {
          maternalAssemblyTracks.push(convertedTrack);
        } else {
          maternalCoordTracks.push(convertedTrack);
        }
      } else if (haplotype === 'pat' || haplotype === 'hap2') {
        if (isAssembly) {
          paternalAssemblyTracks.push(convertedTrack);
        } else {
          paternalCoordTracks.push(convertedTrack);
        }
      } else {
        // Tracks without haplotype use reference coordinates
        referenceCoordTracks.push(convertedTrack);
      }
    });
    
    // Add tracks in the specified order for this sample:
    // 1. Tracks using reference genome coordinates (e.g., expression bigwig)
    allTracks.push(...referenceCoordTracks);
    // 2. Maternal/hap1 genome alignment track
    allTracks.push(...maternalAssemblyTracks);
    // 3. Tracks using maternal/hap1 coordinates (methylation, etc.)
    allTracks.push(...maternalCoordTracks);
    // 4. Paternal/hap2 genome alignment track
    allTracks.push(...paternalAssemblyTracks);
    // 5. Tracks using paternal/hap2 coordinates
    allTracks.push(...paternalCoordTracks);
  });
  
  return allTracks;
}

/**
 * Check if a genome has assembly data for a specific reference genome
 */
export function hasAssemblyForReference(genome: Genome, referenceGenome: string): boolean {
  const tracks = genome.assemblyTracks || (genome.assemblyTrack ? [genome.assemblyTrack] : []);
  const dataReferenceGenome = mapReferenceGenome(referenceGenome);
  return tracks.some(track => {
    const browserAttrs = track.browserAttributes || {};
    const trackRefGenome = browserAttrs.reference_genome || track.referenceGenome;
    return trackRefGenome === dataReferenceGenome;
  });
}

/**
 * Get available reference genomes for assembly tracks
 */
export function getAvailableReferenceGenomes(genomes: Genome[]): string[] {
  const referenceGenomes = new Set<string>();
  
  genomes.forEach(genome => {
    const tracks = genome.assemblyTracks || (genome.assemblyTrack ? [genome.assemblyTrack] : []);
    tracks.forEach(track => {
      const browserAttrs = track.browserAttributes || {};
      const trackRefGenome = browserAttrs.reference_genome || track.referenceGenome;
      if (trackRefGenome) {
        referenceGenomes.add(trackRefGenome);
      }
    });
  });
  
  return Array.from(referenceGenomes).sort();
}
