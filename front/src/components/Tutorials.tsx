import { useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  PlayCircleIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import { DATA_LAYER_INFO } from '../utils/constants';
import { DATA_TYPES, BUTTON, secondaryButton } from '../utils/theme';
import { MAX_SESSIONS } from '../utils/sessionUtils';
import type { DataLayer } from '../utils/genomeTypes';

/** Walkthrough of this portal. */
const WALKTHROUGH_VIDEO_ID = 'cRSbqXqvBEU';

/** The full WashU Epigenome Browser series, of which this portal is one host. */
const WASHU_PLAYLIST_URL =
  'https://www.youtube.com/watch?v=FzzUT7YEqmA&list=PLE0UMwf5se6ng1Nzq--MbFphSgPkIe5ZF';

/** Written documentation for the embedded browser itself. */
const BROWSER_DOCS_URL = 'https://epgg.github.io/';

interface VideoEmbedProps {
  videoId: string;
  title: string;
  nightMode: boolean;
}

/**
 * Click-to-load YouTube embed.
 *
 * Nothing is requested from YouTube until the reader actually asks for the
 * video, so simply opening the Tutorials tab does not hand a third party a page
 * view and a set of cookies — which would sit badly beside the portal's own
 * consent banner. The poster frame is drawn locally rather than fetched from
 * i.ytimg.com for the same reason, and the player is loaded from
 * youtube-nocookie.com once the reader opts in.
 */
function VideoEmbed({ videoId, title, nightMode }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      aria-label={`Play “${title}” (loads YouTube)`}
      className={`group relative aspect-video w-full overflow-hidden rounded-xl border transition-all ${
        nightMode
          ? 'border-gray-700 bg-gradient-to-br from-gray-900 via-primary-900/40 to-gray-900 hover:border-primary-600'
          : 'border-gray-200 bg-gradient-to-br from-primary-50 via-white to-primary-100 hover:border-primary-400'
      }`}
    >
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white shadow-lg transition-transform group-hover:scale-110">
          <PlayCircleIcon className="w-10 h-10" />
        </span>
        <span className={`text-sm font-semibold ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</span>
        <span className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Click to play — the video loads from YouTube
        </span>
      </span>
    </button>
  );
}

interface TutorialsProps {
  nightMode?: boolean;
  onStartInteractiveGuide?: () => void;
}

export default function Tutorials({ nightMode = false, onStartInteractiveGuide }: TutorialsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const exampleSession = `[
  {
    "id": "session_1766443539930_cdgeqam1l",
    "name": "Test",
    "timestamp": 1766443539930,
    "dataSelectorState": {
      "selectedGenomes": [
        "HG00097"
      ],
      "selectedLayers": [
        "methylation"
      ],
      "searchTerm": "",
      "populationFilter": "all",
      "referenceGenome": "hg38"
    },
    "tracks": [
      {
        "id": "hg38__ruler__Ruler",
        "isSelected": true
      },
      {
        "id": "hg38__geneAnnotation__refGene",
        "isSelected": true
      },
      {
        "id": "hg38__geneAnnotation__gencodeV47",
        "isSelected": false
      },
      {
        "id": "hg38__geneAnnotation__MANE_select_1.4",
        "isSelected": false
      },
      {
        "id": "hg38__repeatmasker__rmsk_all",
        "isSelected": true
      },
      {
        "id": "HG00097__genomealign__hg38 vs HG00097 hap1",
        "isSelected": true
      },
      {
        "id": "HG00097__repeatmasker__hap1 RepeatMasker",
        "isSelected": true
      },
      {
        "id": "HG00097__categorical__hap1 CpG islands",
        "isSelected": true
      },
      {
        "id": "HG00097__categorical__hap1 HMM Flagger (PacBio)",
        "isSelected": false
      },
      {
        "id": "HG00097__categorical__hap1 HMM Flagger (ONT)",
        "isSelected": false
      },
      {
        "id": "HG00097__modbed__hap1 ONT methylation",
        "isSelected": false
      },
      {
        "id": "HG00097__methylc__hap1 PacBio methylation",
        "isSelected": true
      },
      {
        "id": "HG00097__genomealign__hg38 vs HG00097 hap2",
        "isSelected": true
      },
      {
        "id": "HG00097__repeatmasker__hap2 RepeatMasker",
        "isSelected": true
      },
      {
        "id": "HG00097__categorical__hap2 CpG islands",
        "isSelected": true
      },
      {
        "id": "HG00097__categorical__hap2 HMM Flagger (PacBio)",
        "isSelected": false
      },
      {
        "id": "HG00097__categorical__hap2 HMM Flagger (ONT)",
        "isSelected": false
      },
      {
        "id": "HG00097__modbed__hap2 ONT methylation",
        "isSelected": false
      },
      {
        "id": "HG00097__methylc__hap2 PacBio methylation",
        "isSelected": true
      }
    ]
  }
]`;

  // `navigator.clipboard` is undefined outside a secure context and the write
  // can be refused by permissions. The old call reported "Copied" regardless
  // and left the rejection unhandled; now a failure says so, and the user can
  // still select the block by hand.
  const copyToClipboard = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(exampleSession);
      setCopyState('copied');
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      setCopyState('failed');
    }
    setTimeout(() => setCopyState('idle'), 2500);
  };

  // Shared, consistent styles for a professional, restrained look
  const heading = nightMode ? 'text-gray-100' : 'text-gray-900';
  const body = nightMode ? 'text-gray-300' : 'text-gray-700';
  const muted = nightMode ? 'text-gray-400' : 'text-gray-600';
  const card = nightMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200';
  const divider = nightMode ? 'border-gray-700' : 'border-gray-200';

  const tabs = [
    { name: 'Sample', desc: 'Select genomes, choose data layers (Methylation, Expression, Chromatin Accessibility), and pick a reference genome (hg38 or chm13). Filter by population and view data visualizations.' },
    { name: 'Track', desc: 'Configure which tracks to display in the browser. Enable or disable individual tracks and filter by type. Reference tracks (ruler, genes) and sample tracks (methylation, expression, genome alignments) can be customized. Genome alignment tracks are always enabled.' },
    { name: 'Browser', desc: 'Visualize your configured tracks in the WashU Epigenome Browser. Navigate chromosomes, zoom, and explore data interactively. Supports fullscreen mode (press F or use the fullscreen button).' },
    { name: 'Sessions', desc: `Save your complete configuration (reference genome, samples, data layers, track selections and browser location) as a session. Keep up to ${MAX_SESSIONS} sessions, export or import them as JSON, and restore your work in one click.` },
    { name: 'Data Availability', desc: 'Overview of all genomes and their available data types. Useful for quickly seeing what data is available across samples.' },
    { name: 'Tutorials', desc: 'Documentation and guides. You can also restart the interactive tutorial from here.' },
  ];

  // Names, platforms, sizes and swatches all come from the shared tables, so
  // this page cannot describe a layer differently from the picker that offers it.
  const dataLayers = (
    ['methylation', 'expression', 'chromatin_accessibility', 'chromatin_conformation'] as DataLayer[]
  ).map((id) => ({
    name: DATA_LAYER_INFO[id].name,
    detail: `${DATA_LAYER_INFO[id].type} · ~${DATA_LAYER_INFO[id].avgSize} GB/sample`,
    dot: DATA_TYPES[id].dot,
  }));

  return (
    <div className={`${card} rounded-2xl shadow-sm border p-8 transition-colors duration-300`}>
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b ${divider}`}>
        <div>
          <h2 className={`text-2xl font-bold ${heading}`}>Tutorials &amp; Documentation</h2>
          <p className={`text-sm mt-1 ${muted}`}>Guides for exploring HPRC epigenomic data.</p>
        </div>
        {onStartInteractiveGuide && (
          <button
            onClick={onStartInteractiveGuide}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${BUTTON.primary}`}
          >
            <PlayCircleIcon className="w-5 h-5" />
            <span>Start Interactive Guide</span>
          </button>
        )}
      </div>

      <div className="space-y-10">
        {/* Getting Started */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-2`}>Getting Started</h3>
          <p className={`${body} mb-3`}>
            Explore epigenomic data from the Human Pangenome Reference Consortium. The workflow follows four steps: <strong>Sample → Track → Browser → Sessions</strong>.
          </p>
          <p className={`text-sm ${muted}`}>
            Browser documentation:{' '}
            <a
              href={BROWSER_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline font-medium ${nightMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-600 hover:text-primary-800'}`}
            >
              epgg.github.io
            </a>
          </p>
        </section>

        {/* Quick Start Workflow */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-4`}>Quick Start</h3>
          <ol className="space-y-3">
            {[
              { t: 'Sample', d: 'Choose genomes and data layers.' },
              { t: 'Track', d: 'Configure which tracks to display.' },
              { t: 'Browser', d: 'Visualize in the WashU Epigenome Browser.' },
              { t: 'Sessions', d: 'Save your configuration for later (optional).' },
            ].map((step, i) => (
              <li key={step.t} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${nightMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  {i + 1}
                </span>
                <p className={`text-sm ${body}`}><strong className={heading}>{step.t}:</strong> {step.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Tab-by-Tab Guide */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-4`}>Tab Guide</h3>
          <div className={`rounded-xl border ${divider} divide-y ${nightMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {tabs.map((tab) => (
              <div key={tab.name} className="p-4">
                <h4 className={`text-sm font-semibold ${heading} mb-1`}>{tab.name}</h4>
                <p className={`text-sm ${body}`}>{tab.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Layers */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-4`}>Available Data Layers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dataLayers.map((layer) => (
              <div key={layer.name} className={`p-4 rounded-lg border ${divider} ${nightMode ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${layer.dot}`} />
                  <h4 className={`font-semibold text-sm ${heading}`}>{layer.name}</h4>
                </div>
                <p className={`text-xs ${muted}`}>{layer.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reference Genomes */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-4`}>Reference Genomes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-lg border ${divider} ${nightMode ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold text-sm ${heading} mb-1`}>GRCh38</h4>
              <p className={`text-xs ${muted}`}>Current standard reference genome.</p>
            </div>
            <div className={`p-4 rounded-lg border ${divider} ${nightMode ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold text-sm ${heading} mb-1`}>CHM13 T2T (v2.0)</h4>
              <p className={`text-xs ${muted}`}>First complete, gapless human genome.</p>
            </div>
          </div>
        </section>

        {/* Session Import Example */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-2`}>Session Import Example</h3>
          <p className={`text-sm ${body} mb-3`}>
            Go to the <strong>Sessions</strong> tab, click &ldquo;Import Session&rdquo;, and paste this example:
          </p>
          <div className="relative">
            <pre className={`${nightMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border p-4 rounded-lg text-xs overflow-x-auto`}>
              <code>{exampleSession}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              aria-live="polite"
              className={`absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                copyState === 'copied'
                  ? 'bg-green-600 text-white'
                  : copyState === 'failed'
                    ? 'bg-red-600 text-white'
                    : secondaryButton(nightMode)
              }`}
            >
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed — select manually' : 'Copy'}
            </button>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-3`}>Quick Tips</h3>
          <ul className={`space-y-1.5 text-sm ${body} list-disc pl-5`}>
            <li>Start with 1&ndash;2 genomes; selecting 5 or more may slow performance.</li>
            <li>Use the Track tab to customize which tracks display in the Browser.</li>
            <li>Genome alignment tracks are always enabled and cannot be disabled.</li>
            <li>Use population filters to narrow genome selections.</li>
            <li>Save sessions to preserve your genome, data layer, and track selections.</li>
            <li>Press F or use the fullscreen button in the Browser for immersive viewing.</li>
          </ul>
        </section>

        {/* Video Tutorials */}
        <section>
          <h3 className={`text-lg font-semibold ${heading} mb-2`}>Video Tutorials</h3>
          <p className={`text-sm ${muted} mb-4`}>
            A full walkthrough of this portal, plus the complete WashU Epigenome Browser series.
          </p>

          <VideoEmbed
            videoId={WALKTHROUGH_VIDEO_ID}
            title="HPRC Epigenome Browser — full walkthrough"
            nightMode={nightMode}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <a
              href={WASHU_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${divider} ${
                nightMode ? 'bg-gray-800/40 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <QueueListIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${nightMode ? 'text-primary-300' : 'text-primary-600'}`} />
              <span className="min-w-0">
                <span className={`flex items-center gap-1.5 font-semibold text-sm ${heading}`}>
                  WashU Epigenome Browser playlist
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 flex-shrink-0" />
                </span>
                <span className={`block text-xs mt-0.5 ${muted}`}>
                  The full video series on the browser powering this portal.
                </span>
              </span>
            </a>

            <a
              href={BROWSER_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${divider} ${
                nightMode ? 'bg-gray-800/40 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <BookOpenIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${nightMode ? 'text-primary-300' : 'text-primary-600'}`} />
              <span className="min-w-0">
                <span className={`flex items-center gap-1.5 font-semibold text-sm ${heading}`}>
                  epgg.github.io
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 flex-shrink-0" />
                </span>
                <span className={`block text-xs mt-0.5 ${muted}`}>
                  Written documentation for the WashU Epigenome Browser.
                </span>
              </span>
            </a>
          </div>
        </section>

        {/* Learn More */}
        <section className={`pt-6 border-t ${divider}`}>
          <p className={`text-sm ${body}`}>
            Learn more about the Human Pangenome Reference Consortium at{' '}
            <a
              href="https://humanpangenome.org"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline font-medium ${nightMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-600 hover:text-primary-800'}`}
            >
              humanpangenome.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
