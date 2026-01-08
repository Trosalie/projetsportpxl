import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { ChartData, ChartOptions } from 'chart.js'
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-general-graph',
  standalone: false, // si ton projet utilise NgModule
  templateUrl: './general-graph.html',
  styleUrl: './general-graph.scss',
})
export class GeneralGraph implements OnInit {

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

    chartData: ChartData<'line'> = {
        labels: [],
        datasets: []
    };

    chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Évolution Mensuelle des Commissions et Argent Crédits'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Mois'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Valeur (€)'
                }
            }
        }
    };

    constructor(private invoiceService: InvoiceService) {}

    ngOnInit() {
        this.loadFinancialData();
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
        this.computeMetrics(); // calcul des métriques une fois les données prêtes
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
        this.computeMonthlyData();
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

    computeMonthlyData(): void {
        // Calcul de l'argent des crédits par mois
        this.caParMois = this.groupByMonth(this.creditsFinancialInfo || [], 'amount');

        // Calcul des commissions par mois
        this.commissionParMois = this.groupByMonth(this.turnoverFinancialInfo || [], 'commission');

        console.log('Argent Crédits par mois:', this.caParMois);
        console.log('Commission par mois:', this.commissionParMois);

        // Générer les données du graphique
        this.generateChartData();
    }

    generateChartData(): void {
        // Collecter tous les mois uniques
        const allMonths = new Set([
            ...Object.keys(this.caParMois),
            ...Object.keys(this.commissionParMois)
        ]);

        const sortedMonths = Array.from(allMonths).sort();

        this.chartData = {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Argent Crédits (par mois)',
                    data: sortedMonths.map(month => this.caParMois[month] || 0),
                    borderColor: 'orange',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Commission (par mois)',
                    data: sortedMonths.map(month => this.commissionParMois[month] || 0),
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.1)',
                    tension: 0.1
                }
            ]
        };
    }


}