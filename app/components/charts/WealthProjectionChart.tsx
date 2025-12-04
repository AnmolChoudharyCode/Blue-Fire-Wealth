'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useDarkMode } from '../common/DarkModeProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom plugin for vertical crosshair line (stock chart style)
const createVerticalLinePlugin = (isDarkMode: boolean) => ({
  id: 'verticalLine',
  afterDraw: (chart: any) => {
    const { ctx, chartArea } = chart;
    
    if (!chart.tooltip || !chart.tooltip._active || chart.tooltip._active.length === 0) {
      return;
    }

    const activePoint = chart.tooltip._active[0];
    const x = activePoint.element.x;
    const topY = chartArea.top;
    const bottomY = chartArea.bottom;

    // Only draw if x is within chart area
    if (x < chartArea.left || x > chartArea.right) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = isDarkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.stroke();
    ctx.restore();
  },
});

interface ProjectionData {
  year: number;
  investment: number;
  goalsRequired: number;
}

interface WealthProjectionChartProps {
  projections: ProjectionData[];
}

export default function WealthProjectionChart({ projections }: WealthProjectionChartProps) {
  const { isDarkMode } = useDarkMode();
  const verticalLinePlugin = useMemo(() => createVerticalLinePlugin(isDarkMode), [isDarkMode]);

  const chartData = useMemo(() => {
    const labels = projections.map((p) => p.year.toString());
    const investmentValues = projections.map((p) => p.investment);
    const goalsValues = projections.map((p) => p.goalsRequired);

    return {
      labels,
      datasets: [
        {
          label: 'Investment Value',
          data: investmentValues,
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        },
        {
          label: 'Goals Requirement',
          data: goalsValues,
          borderColor: 'rgb(234, 179, 8)', // yellow-500
          backgroundColor: 'rgba(234, 179, 8, 0.05)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgb(234, 179, 8)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    };
  }, [projections]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)',
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)',
        bodyColor: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)',
        borderColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(59, 130, 246)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: '600' as const,
        },
        bodyFont: {
          size: 12,
          weight: '500' as const,
        },
        callbacks: {
          title: function(context: any) {
            return `Year: ${context[0].label}`;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            let formattedValue = '';
            if (value >= 10000000) {
              formattedValue = `₹${(value / 10000000).toFixed(2)}Cr`;
            } else if (value >= 100000) {
              formattedValue = `₹${(value / 100000).toFixed(2)}L`;
            } else if (value >= 1000) {
              formattedValue = `₹${(value / 1000).toFixed(2)}K`;
            } else {
              formattedValue = `₹${Math.round(value).toLocaleString('en-IN')}`;
            }
            return `${context.dataset.label}: ${formattedValue}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (numValue >= 10000000) {
              return `₹${(numValue / 10000000).toFixed(1)}Cr`;
            } else if (numValue >= 100000) {
              return `₹${(numValue / 100000).toFixed(1)}L`;
            } else if (numValue >= 1000) {
              return `₹${(numValue / 1000).toFixed(1)}K`;
            }
            return `₹${Math.round(numValue).toLocaleString('en-IN')}`;
          },
        },
      },
    },
  }), [isDarkMode]);

  if (!projections || projections.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No data available. Please enter your financial information to see projections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80 relative">
      <Line data={chartData} options={options} plugins={[verticalLinePlugin]} />
    </div>
  );
}

