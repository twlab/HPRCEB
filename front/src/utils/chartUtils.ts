// Chart visualization utilities using Chart.js
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import type { DataLayer } from './genomeTypes';
import { getSampleDataSize, DataType } from './genomeDataService';
import { dataTypeToken } from './theme';

Chart.register(...registerables);

let chartInstance: Chart | null = null;

/** `#rrggbb` → `rgba(r, g, b, alpha)`, so a bar's fill and its border can share one token. */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const [r, g, b] = [m[1], m[2], m[3]].map((c) => parseInt(c, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** One stacked bar series, coloured from the shared assay palette. */
function datasetFor(dataType: DataType, selectedGenomes: string[]) {
  const token = dataTypeToken(dataType);
  return {
    label: token.label,
    data: selectedGenomes.map((id) => getSampleDataSize(id, [dataType])),
    backgroundColor: withAlpha(token.hex, 0.7),
    borderColor: token.hex,
    borderWidth: 1,
  };
}

export function createDataChart(
  selectedGenomes: string[],
  selectedLayers: DataLayer[],
  canvasElement: HTMLCanvasElement
): void {
  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (selectedGenomes.length === 0) {
    return;
  }

  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  // Prepare data for the chart
  const labels = selectedGenomes;

  // Assembly is always stacked in; the functional layers follow the picker.
  const LAYER_ORDER: DataLayer[] = [
    'methylation',
    'expression',
    'chromatin_accessibility',
    'chromatin_conformation',
  ];

  const datasets: ChartConfiguration<'bar'>['data']['datasets'] = [
    datasetFor('assembly', selectedGenomes),
    ...LAYER_ORDER.filter((layer) => selectedLayers.includes(layer)).map((layer) =>
      datasetFor(layer as DataType, selectedGenomes)
    ),
  ];

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Data Size by Genome (GB)",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + (context.parsed.y ?? 0).toFixed(1) + " GB";
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Size (GB)",
          },
        },
      },
    },
  });
}
