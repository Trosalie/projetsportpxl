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

    graphInfoCreditsInvoice: any;
    graphInfoTurnoverInvoice: any;

    labelsMonthsGraph: any = [];
    graphData1: any = [];
    graphData2: any = [];
    labelData1: string = 'Ventes de Crédits (€)';
    labelData2: string = 'Chiffre d\'Affaires (€)';


    lineChartConfig: ChartConfiguration = {
        type: 'line',
        data: {
        labels: this.labelsMonthsGraph,
        datasets: [
            {
            label: this.labelData1,
            data: this.graphData1,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2
            },
            {
            label: this.labelData2,
            data: this.graphData2,
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
            max: 150,
            }
        }
        }
    };


    creditsFinancialInfo: any = null;
    turnoverFinancialInfo: any = null;

    loading = true;
    error: string | null = null;

    totalRevenue = 0;
    totalCreditsVendus = 0;
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

    // Initialisation des graphiques
    private initializeCharts(): void {
        this.adaptTabOfDatas();

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

    //Affiche les information lorsque le chargement est terminé
    checkLoadingDone(): void {
        if (this.creditsFinancialInfo && this.turnoverFinancialInfo) {
            this.loading = false;
            this.computeMetrics();

            setTimeout(() => {
            this.initializeCharts();
            });
        }
    }

    // calcul les informations financières
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
        this.totalCreditsVendus = 0;
        if (Array.isArray(this.creditsFinancialInfo)) {
        this.totalCreditsVendus = this.creditsFinancialInfo.reduce((sum, invoice) => sum + (parseInt(invoice.credits) || 0), 0);
        }

        // Calcul de la commission totale
        this.totalCommission = 0;
        if (Array.isArray(this.turnoverFinancialInfo)) {
        this.totalCommission = this.turnoverFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.commission) || 0), 0);
        }


        console.log('Total Revenue:', this.totalRevenue);
        console.log('Total Credits:', this.totalCreditsVendus);
        console.log('Total Commission:', this.totalCommission);

        // Calcul des données mensuelles
        //this.computeMonthlyData();
        this.graphInfoCreditsInvoice = this.groupByMonth(this.creditsFinancialInfo, 'amount');
        this.graphInfoTurnoverInvoice = this.groupByMonth(this.turnoverFinancialInfo, 'commission');
  
    }


    getTotalRevenue(): number {
        return this.totalRevenue;
    }

    getTotalCreditsSold(): number {
        return this.totalCreditsVendus;
    }

    getTotalCommission(): number {
        return this.totalCommission;
    }



    // Fonction pour regrouper par mois
    groupByMonth(invoices: any[], nameField: string) {
        let newInvoicesList: any = [];
        for (let invoice of invoices) {
            const yearMonth = invoice.issue_date.slice(0, 7);
            
            //parse float sert à convertir une chaîne de caractères en nombre à virgule flottante
            const amount = Math.round(parseFloat(invoice[nameField]) || 0);
            
            if (newInvoicesList.find((item: any) => item[0] === yearMonth) === undefined) {
                newInvoicesList.push([invoice.issue_date.slice(0, 7), amount]);
            }
            else {                
                for (let item of newInvoicesList) {
                    if (item[0] === invoice.issue_date.slice(0, 7)) {
                        item[1] += amount;
                    }
                }
            }
        }
        console.log('Grouped by month:', newInvoicesList);
        return newInvoicesList;
    }


    adaptTabOfDatas() {
        //adapte les tableau pour qu'il y ait la même taille
        for (let item of this.graphInfoCreditsInvoice) {
            const month = item[0];
            if (!this.graphInfoTurnoverInvoice.find((i: any) => i[0] === month)) {
                this.graphInfoTurnoverInvoice.push([month, 0]);
            }
        }
        for (let item of this.graphInfoTurnoverInvoice) {
            const month = item[0];
            if (!this.graphInfoCreditsInvoice.find((i: any) => i[0] === month)) {
                this.graphInfoCreditsInvoice.push([month, 0]);
            }
        }

        // Trier les deux tableaux par date croissante 
        const sortByDate = (a: [string, number], b: [string, number]) => {
            const dateA = new Date(a[0] + '-01');
            const dateB = new Date(b[0] + '-01');
            return dateA.getTime() - dateB.getTime();
        };

        this.graphInfoCreditsInvoice.sort(sortByDate);
        this.graphInfoTurnoverInvoice.sort(sortByDate);

        // remplie les datas de la première courbe et les labels
        for (let item of this.graphInfoCreditsInvoice) {
            this.labelsMonthsGraph.push(item[0]);
            this.graphData1.push(item[1]);
            
        }

        // remplie les datas de la deuxième courbe et ajoute les mois manquants dans les labels
        for(let item of this.graphInfoTurnoverInvoice){
            if (!this.labelsMonthsGraph.includes(item[0])) {
                this.labelsMonthsGraph.push(item[0]);
            }
            this.graphData2.push(item[1]);
        }

        //Adapte l'échelle Y en fonction des données
        if (this.graphData1.length) {
            let maxValue: number;
            if (Math.max(...this.graphData1) > Math.max(...this.graphData2)) {
                maxValue = Math.max(...this.graphData1);
            }
            else {
                maxValue = Math.max(...this.graphData2);
            }
            const yAxisMax = Math.ceil(maxValue * 1.1); 

            this.lineChartConfig.options!.scales!['y']!.max = yAxisMax;
        }
        console.log('Labels Months Graph:', this.labelsMonthsGraph);
        console.log('Graph Data 1:', this.graphData1);
    }
}