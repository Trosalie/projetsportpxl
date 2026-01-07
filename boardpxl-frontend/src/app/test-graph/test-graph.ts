import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-test-graph',
  standalone: false,
  templateUrl: './test-graph.html',
  styleUrl: './test-graph.scss',
})
export class TestGraph implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;

  lineChart: Chart | null = null;
  barChart: Chart | null = null;
  doughnutChart: Chart | null = null;

  // Line Chart Configuration
  lineChartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Sales 2024',
          data: [30, 59, 80, 81, 56, 55, 40, 70, 85, 92, 88, 95],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Sales 2025',
          data: [40, 65, 90, 95, 70, 75, 60, 85, 100, 110, 105, 120],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 150
        }
      }
    }
  };

  // Bar Chart Configuration
  barChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
      datasets: [
        {
          label: 'Q1 2024',
          data: [65, 59, 80, 81, 56],
          backgroundColor: '#3b82f6'
        },
        {
          label: 'Q2 2024',
          data: [75, 69, 90, 95, 66],
          backgroundColor: '#10b981'
        },
        {
          label: 'Q3 2024',
          data: [85, 79, 100, 105, 76],
          backgroundColor: '#f59e0b'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Doughnut Chart Configuration
  doughnutChartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Category A', 'Category B', 'Category C', 'Category D'],
      datasets: [
        {
          label: 'Distribution',
          data: [30, 25, 20, 25],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const
        },
        title: {
          display: false
        }
      }
    }
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize chart data if needed
    console.log('Test Graph component initialized with chart data');
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  private initializeCharts(): void {
    if (this.lineChartCanvas) {
      this.lineChart = new Chart(this.lineChartCanvas.nativeElement, this.lineChartConfig);
    }
    if (this.barChartCanvas) {
      this.barChart = new Chart(this.barChartCanvas.nativeElement, this.barChartConfig);
    }
    if (this.doughnutChartCanvas) {
      this.doughnutChart = new Chart(this.doughnutChartCanvas.nativeElement, this.doughnutChartConfig);
    }
  }

  ngOnDestroy(): void {
    // Destroy charts on component destroy
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
  }
}
