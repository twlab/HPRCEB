// Chart visualization utilities using Chart.js
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import type { Genome, DataLayer } from './genomeTypes';

Chart.register(...registerables);

let chartInstance: Chart | null = null;

export function createDataChart(
  selectedGenomes: string[],
  genomeData: Genome[],
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
  const labels = selectedGenomes.map((id) => {
    const genome = genomeData.find((g) => g.id === id);
    return genome ? genome.id : id;
  });

  const datasets: ChartConfiguration<'bar'>['data']['datasets'] = [];

  // Assembly data
  datasets.push({
    label: "Assembly",
    data: selectedGenomes.map((id) => {
      const genome = genomeData.find((g) => g.id === id);
      return genome ? genome.assemblySize : 0;
    }),
    backgroundColor: "rgba(107, 114, 128, 0.7)",
    borderColor: "rgba(107, 114, 128, 1)",
    borderWidth: 1,
  });

  // Add selected data layers
  if (selectedLayers.includes("methylation")) {
    datasets.push({
      label: "Methylation",
      data: selectedGenomes.map((id) => {
        const genome = genomeData.find((g) => g.id === id);
        return genome && genome.methylation ? genome.methylationSize || 0 : 0;
      }),
      backgroundColor: "rgba(62, 91, 149, 0.7)", // Academic blue
      borderColor: "rgba(62, 91, 149, 1)",
      borderWidth: 1,
    });
  }

  if (selectedLayers.includes("expression")) {
    datasets.push({
      label: "Expression",
      data: selectedGenomes.map((id) => {
        const genome = genomeData.find((g) => g.id === id);
        return genome && genome.expression ? genome.expressionSize || 0 : 0;
      }),
      backgroundColor: "rgba(16, 185, 129, 0.7)",
      borderColor: "rgba(16, 185, 129, 1)",
      borderWidth: 1,
    });
  }

  if (selectedLayers.includes("chromatin_accessibility")) {
    datasets.push({
      label: "Chromatin Accessibility",
      data: selectedGenomes.map((id) => {
        const genome = genomeData.find((g) => g.id === id);
        return genome && genome.chromatinAccessibility ? genome.chromatinAccessibilitySize || 0 : 0;
      }),
      backgroundColor: "rgba(245, 158, 11, 0.7)",
      borderColor: "rgba(245, 158, 11, 1)",
      borderWidth: 1,
    });
  }

  if (selectedLayers.includes("chromatin_conformation")) {
    datasets.push({
      label: "Chromatin Conformation",
      data: selectedGenomes.map((id) => {
        const genome = genomeData.find((g) => g.id === id);
        return genome && genome.chromatinConformation ? genome.chromatinConformationSize || 0 : 0;
      }),
      backgroundColor: "rgba(139, 92, 246, 0.7)",
      borderColor: "rgba(139, 92, 246, 1)",
      borderWidth: 1,
    });
  }

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
              return context.dataset.label + ": " + context.parsed.y.toFixed(1) + " GB";
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
