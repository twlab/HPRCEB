import type { TracksProps } from './browserTypes';
import type { TrackEntry } from './genomeDataService';



export interface Track {
  sampleId: string;
  metadata: Record<string, string | number | boolean>;
  displayAttributes: TracksProps;
  isSelected: boolean;
}


export interface TrackSelectionInput {
  selectedSamples: string[];
  reference: string;
  availableTracks: Record<string, TrackEntry[]>;
  selectedLayers: string[];
}

export interface TrackSelectionOutput {
  tracks: Track[];
}




const hg38_default_tracks = [{
    type: "ruler",
    name: "Ruler",
  },
  {
    type: "geneAnnotation",
    name: "refGene",
    genome: "hg38",
  },
  {
    type: "geneAnnotation",
    name: "gencodeV47",
    genome: "hg38",
  },
  {
    type: "geneAnnotation",
    name: "MANE_select_1.4",
    label: "MANE selection v1.4",
    genome: "hg38",
  },
  {
    type: "repeatmasker",
    name: "rmsk_all",
    options: { label: "RepeatMasker" },
    url: "https://vizhub.wustl.edu/public/hg38/rmsk16.bb",
  },

  ]

/*

  {
    type: "vcf",
    url: "https://wangcluster.wustl.edu/~wzhang/projects/HPRCEN/data/graph_vcf/hprc-sep8-mc-grch38.wave.vcf.gz",
    label: "HPRC Y2 vcf",
  },
  */


const chm13_default_tracks = [{
    type: "ruler",
    name: "Ruler",
},
{
    type: "geneAnnotation",
    name: "gencodeV35",
    label: "gencodeV35"
},
{
    type: "rmskv2",
    name: "RepeatMaskerV2",
    url: "https://vizhub.wustl.edu/public/t2t-chm13-v1.1/rmsk.bigBed",
}]













export function selectTracks(input: TrackSelectionInput): TrackSelectionOutput {
  const { selectedSamples, reference, availableTracks, selectedLayers } = input;

  const result: Track[] = [];

  // console.log("selectedSamples", selectedSamples);
  // console.log("reference", reference);
  // console.log("availableTracks", availableTracks);
  // console.log("selectedLayers", selectedLayers);


  const default_tracks = reference === "t2t-chm13-v2.0" 
    ? chm13_default_tracks 
    : hg38_default_tracks;

  
  for (const trackAttrs of default_tracks) {
    result.push({
      sampleId: reference,
      metadata: {
        name: trackAttrs.name,
        type: "-",
        track_type: trackAttrs.type,
        coordinate: reference,
        url: "-",
      },
      displayAttributes: trackAttrs,
      isSelected: true,
    });
  }

  if (reference == 'hg38') {
    result[2].isSelected = false;
    result[3].isSelected = false;
  }

  for (const sample of selectedSamples) {
    const sample_tracks = availableTracks[sample];

    let sample_tracks_result: Track[] = [];
    if (sample_tracks) {
      for (const track of sample_tracks) {
        let coord = track.browser_attributes.coordinate;
        let isSelected = true;
        if (coord === "chm13") {
            coord = "t2t-chm13-v2.0";
        }
        

        if (coord !== reference) {
            if (["hg38", "t2t-chm13-v2.0"].includes(coord)) {
                continue;
            }
        }

        
        if (['methylation', 'expression', 'chromatin_accessibility', 'chromatin_conformation'].includes(track.data_type)) {
          if (!selectedLayers.includes(track.data_type)) {
            continue;
          }
        }

        if (track.browser_attributes.name.includes("HMM Flagger")) {
          isSelected = false;
        }


        sample_tracks_result.push({
          sampleId: sample,
          metadata: {
            name: track.browser_attributes.name,
            type: track.data_type,
            track_type: track.browser_attributes.type,
            coordinate: coord,
            url: track.browser_attributes.url,
          },
          displayAttributes: track.browser_attributes as TracksProps,
          isSelected: isSelected,
        });

      }
      result.push(...sample_tracks_result);
    }
  }

  

  return {
    tracks: result,
  };
}
