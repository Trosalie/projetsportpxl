import { InvoiceService } from '../services/invoice-service';
import { ChartData, ChartOptions } from 'chart.js'
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-general-graph',
  standalone: false, // si ton projet utilise NgModule
  templateUrl: './general-graph.html',
  styleUrl: './general-graph.scss',
})
export class GeneralGraph implements OnInit {
    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
    lineChart: Chart | null = null;

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


    creditsFinancialInfo: any = null;
    turnoverFinancialInfo: any = null;

    loading = true;
    error: string | null = null;

    totalRevenue = 0;
    totalCredits = 0;
    totalCommission = 0;

    creditsParMois: { [month: string]: number } = {};
    caParMois: { [month: string]: number } = {};
    commissionParMois: { [month: string]: number } = {};

    

    constructor(private invoiceService: InvoiceService) {}

    ngOnInit() {
        this.loadFinancialData();
    }

    ngAfterViewInit(): void {
        if (!this.loading && !this.error) {
            this.initializeCharts();
        }
    }

    private initializeCharts(): void {
        if (this.lineChartCanvas) {
            this.lineChart = new Chart(this.lineChartCanvas.nativeElement, this.lineChartConfig);
        }
    }

    loadFinancialData(): void {
        this.loading = true;
        this.error = null;

        // --- Chargement des crédits ---
        this.invoiceService.getCreditsFinancialInfo().subscribe({
        next: (data) => {
            this.creditsFinancialInfo = data;
            console.log('Credits Financial Info:', data);
            this.checkLoadingDone();
        },
        error: (err) => {
            console.error('Erreur chargement crédits', err);
            this.error = 'Erreur lors du chargement des crédits';
            this.loading = false;
        }
        });

        // --- Chargement du chiffre d’affaires ---
        this.invoiceService.getTurnoverFinancialInfo().subscribe({
        next: (data) => {
            this.turnoverFinancialInfo = data;
            console.log('Turnover Financial Info:', data);
            this.checkLoadingDone();
        },
        error: (err) => {
            console.error('Erreur chargement CA', err);
            this.error = 'Erreur lors du chargement du chiffre d’affaires';
            this.loading = false;
        }
        });
    }

    checkLoadingDone(): void {
        if (this.creditsFinancialInfo && this.turnoverFinancialInfo) {
            this.loading = false;
            this.computeMetrics();

            setTimeout(() => {
            this.initializeCharts();
            });
        }
    }

    computeMetrics(): void {
        // Calcul du chiffre d'affaires total
        this.totalRevenue = 0;
        if (Array.isArray(this.creditsFinancialInfo)) {
        this.totalRevenue += this.creditsFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
        }
        if (Array.isArray(this.turnoverFinancialInfo)) {
        this.totalRevenue += this.turnoverFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.raw_value) || 0), 0);
        }

        // Calcul du total des crédits vendus
        this.totalCredits = 0;
        if (Array.isArray(this.creditsFinancialInfo)) {
        this.totalCredits = this.creditsFinancialInfo.reduce((sum, invoice) => sum + (parseInt(invoice.credits) || 0), 0);
        }

        // Calcul de la commission totale
        this.totalCommission = 0;
        if (Array.isArray(this.turnoverFinancialInfo)) {
        this.totalCommission = this.turnoverFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.commission) || 0), 0);
        }

        console.log('Total Revenue:', this.totalRevenue);
        console.log('Total Credits:', this.totalCredits);
        console.log('Total Commission:', this.totalCommission);

        // Calcul des données mensuelles
        //this.computeMonthlyData();
  
    }


    getTotalRevenue(): number {
        return this.totalRevenue;
    }

    getTotalCreditsSold(): number {
        return this.totalCredits;
    }

    getTotalCommission(): number {
        return this.totalCommission;
    }



    // Fonction pour regrouper par mois
    groupByMonth(factures: any[], valueKey: string, dateKey: string = 'created_at') {
        const grouped: { [month: string]: number } = {};

        factures.forEach(facture => {
            const date = new Date(facture[dateKey]);
            const month = `${date.getFullYear()}-${('0'+(date.getMonth()+1)).slice(-2)}`; // ex: 2025-11
            grouped[month] = (grouped[month] || 0) + Number(facture[valueKey] ?? 0);
        });

        return grouped;
    }


}