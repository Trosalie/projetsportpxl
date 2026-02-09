import { InvoiceService } from '../services/invoice-service';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
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
    labelData1: string = this.translate.instant('GENERAL_GRAPH.LABEL_GRAPH_CREDIT');
    labelData2: string = this.translate.instant('GENERAL_GRAPH.LABEL_GRAPH_TURNOVER');


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

    // Filtres
    protected openDropdown: string | null = null;
    protected activeFilters: string[] = ['Crédits vendus', 'Commission'];
    protected dateFilters: Map<string, string> = new Map();

    protected readonly dataTypeFilters = ['Crédits vendus', 'Chiffre d\'affaires', 'Commission'];
    protected readonly periodFilters = ['Après le', 'Avant le'];

    // Totaux additionnels
    totalCreditsAmount = 0;

    // Données originales pour réinitialiser/filtrer
    private originalCreditsInfo: any[] = [];
    private originalTurnoverInfo: any[] = [];



    constructor(private invoiceService: InvoiceService) {}

    ngOnInit() {
        this.loadFinancialData();
    }

    ngAfterViewInit(): void {
        // Le graphique sera initialisé après le chargement des données dans checkLoadingDone()
    }

    // Initialisation des graphiques
    private initializeCharts(): void {
        if (!this.lineChartCanvas?.nativeElement) {
            console.error('Canvas not available');
            return;
        }

        // Détruire le graphique existant si présent
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }

        this.adaptTabOfDatas();

        try {
            this.lineChart = new Chart(this.lineChartCanvas.nativeElement, this.lineChartConfig);
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }

    loadFinancialData(): void {
        this.loading = true;
        this.error = null;

        // --- Chargement des crédits ---
        this.invoiceService.getCreditsFinancialInfo().subscribe({
        next: (data) => {
            this.creditsFinancialInfo = data;
            this.originalCreditsInfo = Array.isArray(data) ? [...data] : [];
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
            this.originalTurnoverInfo = Array.isArray(data) ? [...data] : [];
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

            // S'assurer que la vue est prête avant d'initialiser le graphique
            setTimeout(() => {
                this.initializeCharts();
            }, 100);
        }
    }

    // calcul les informations financières
    computeMetrics(): void {
        // Calcul du chiffre d'affaires total
        this.totalRevenue = 0;
        this.totalCreditsAmount = 0;
        if (Array.isArray(this.creditsFinancialInfo)) {
        const creditsEuro = this.creditsFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
        this.totalRevenue += creditsEuro;
        this.totalCreditsAmount = creditsEuro;
        }
        if (Array.isArray(this.turnoverFinancialInfo)) {
        this.totalRevenue += this.turnoverFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.raw_value) || 0), 0);
        }

        // Calcul du total des crédits vendus (en unités, si besoin ailleurs)
        this.totalCreditsVendus = 0;
        if (Array.isArray(this.creditsFinancialInfo)) {
        this.totalCreditsVendus = this.creditsFinancialInfo.reduce((sum, invoice) => sum + (parseInt(invoice.credits) || 0), 0);
        }

        // Calcul de la commission totale
        this.totalCommission = 0;
        if (Array.isArray(this.turnoverFinancialInfo)) {
        this.totalCommission = this.turnoverFinancialInfo.reduce((sum, invoice) => sum + (parseFloat(invoice.commission) || 0), 0);
        }


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

    getTotalCreditsAmount(): number {
        return this.totalCreditsAmount;
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
        return newInvoicesList;
    }


    adaptTabOfDatas() {
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
    }

    // Gestion des filtres
    toggleDropdown(dropdownType: string, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.openDropdown = this.openDropdown === dropdownType ? null : dropdownType;
    }

    toggleFilter(filterValue: string) {
        if (this.activeFilters.includes(filterValue)) {
            this.removeFilter(filterValue);
        } else {
            this.addFilter(filterValue);
        }
    }

    addFilter(filterValue: string) {
        if (!this.activeFilters.includes(filterValue)) {
            this.activeFilters.push(filterValue);
        }
    }

    removeFilter(filterValue: string) {
        this.activeFilters = this.activeFilters.filter(f => f !== filterValue);
        if (this.isDateFilter(filterValue)) {
            this.dateFilters.delete(filterValue);
        }
    }

    isDateFilter(filterValue: string): boolean {
        return this.periodFilters.includes(filterValue);
    }

    isFilterActive(filterValue: string): boolean {
        return this.activeFilters.includes(filterValue);
    }

    addDateFilter(filterValue: string) {
        if (!this.activeFilters.includes(filterValue)) {
            this.activeFilters.push(filterValue);
            this.dateFilters.set(filterValue, '');
        }

        setTimeout(() => {
            const input = document.querySelector(`.date-input[data-filter="${filterValue}"]`) as HTMLInputElement;
            if (input) {
                input.focus();
                input.showPicker?.();
            }
        }, 100);
    }

    getDateValue(filterValue: string): string {
        return this.dateFilters.get(filterValue) || '';
    }

    updateDateFilter(filterValue: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const newValue = input.value;

        if (this.isDateRangeValid(filterValue, newValue)) {
            this.dateFilters.set(filterValue, newValue);
        } else {
            input.value = this.dateFilters.get(filterValue) || '';
            alert(this.translate.instant('GENERAL_GRAPH.ALERT_UPDATE_DATE_FILTER'));
        }
    }

    private isDateRangeValid(filterValue: string, newValue: string): boolean {
        if (!newValue) {
            return true;
        }

        const afterDate = filterValue === 'Après le' ? newValue : this.dateFilters.get('Après le');
        const beforeDate = filterValue === 'Avant le' ? newValue : this.dateFilters.get('Avant le');

        if (afterDate && beforeDate) {
            return new Date(afterDate) < new Date(beforeDate);
        }

        return true;
    }

    hasActiveDataTypeFilters(): boolean {
        return this.activeFilters.some(f => this.dataTypeFilters.includes(f));
    }

    hasActivePeriodFilters(): boolean {
        return this.activeFilters.some(f => this.periodFilters.includes(f));
    }

    canApplyFilters(): boolean {
        return this.hasActiveDataTypeFilters() || this.hasActivePeriodFilters();
    }

    clearCategoryFilters(category: string, event: Event): void {
        event.stopPropagation();

        let filtersToRemove: string[] = [];

        switch(category) {
            case 'dataType':
                filtersToRemove = this.dataTypeFilters;
                break;
            case 'period':
                filtersToRemove = this.periodFilters;
                break;
        }

        filtersToRemove.forEach(filter => {
            if (this.activeFilters.includes(filter)) {
                this.removeFilter(filter);
            }
        });
    }

    applyFilters(): void {
        // Empêcher l'application si aucun filtre n'est coché
        if (!this.canApplyFilters()) {
            alert(this.translate.instant('GENERAL_GRAPH.ALERT_APPLY_FILTERS'));
            return;
        }
        // 1) Préparer les données filtrées (par date)
        const startDate = this.dateFilters.get('Après le') || '';
        const endDate = this.dateFilters.get('Avant le') || '';

        let filteredCredits = [...this.originalCreditsInfo];
        let filteredTurnover = [...this.originalTurnoverInfo];

        const inRange = (isoDate: string) => {
            const d = new Date(isoDate);
            if (startDate && d < new Date(startDate)) return false;
            if (endDate && d > new Date(endDate)) return false;
            return true;
        };

        if (startDate || endDate) {
            filteredCredits = filteredCredits.filter((inv: any) => inv?.issue_date && inRange(inv.issue_date));
            filteredTurnover = filteredTurnover.filter((inv: any) => inv?.issue_date && inRange(inv.issue_date));
        }

        // 2) Recalculer les métriques de la sidebar sur les données filtrées
        this.creditsFinancialInfo = filteredCredits;
        this.turnoverFinancialInfo = filteredTurnover;
        this.computeMetrics();

        // 3) Déterminer les séries à afficher
        const hasType = this.hasActiveDataTypeFilters();
        const showCredits = !hasType || this.isFilterActive('Crédits vendus');
        const showCA = !hasType || this.isFilterActive('Chiffre d\'affaires');
        const showCommission = !hasType || this.isFilterActive('Commission');

        // 4) Construire les séries mensuelles
        const monthKey = (iso: string) => iso?.slice(0, 7);
        const addToMap = (map: Map<string, number>, key: string | undefined, val: number) => {
            if (!key) return;
            map.set(key, (map.get(key) || 0) + (isFinite(val) ? val : 0));
        };

        const creditsMap = new Map<string, number>(); // amount
        const caMap = new Map<string, number>();       // raw_value
        const commissionMap = new Map<string, number>(); // commission

        if (showCredits) {
            for (const inv of filteredCredits) addToMap(creditsMap, monthKey(inv?.issue_date), Math.round(parseFloat(inv?.amount) || 0));
        }
        if (showCA || showCommission) {
            for (const inv of filteredTurnover) {
                const mk = monthKey(inv?.issue_date);
                if (showCA) addToMap(caMap, mk, Math.round(parseFloat(inv?.raw_value) || 0));
                if (showCommission) addToMap(commissionMap, mk, Math.round(parseFloat(inv?.commission) || 0));
            }
        }

        // 5) Construire les labels (union des mois utilisés) et les datasets alignés
        const monthSet = new Set<string>();
        if (showCredits) creditsMap.forEach((_, k) => monthSet.add(k));
        if (showCA) caMap.forEach((_, k) => monthSet.add(k));
        if (showCommission) commissionMap.forEach((_, k) => monthSet.add(k));

        const labels = Array.from(monthSet);
        labels.sort((a, b) => new Date(a + '-01').getTime() - new Date(b + '-01').getTime());

        const datasetFor = (label: string, color: string, bg: string, map: Map<string, number>) => ({
            label,
            data: labels.map(m => map.get(m) || 0),
            borderColor: color,
            backgroundColor: bg,
            tension: 0.4,
            fill: true,
            borderWidth: 2
        });

        const datasets: any[] = [];
        if (showCredits) datasets.push(datasetFor(this.labelData1, '#3b82f6', 'rgba(59, 130, 246, 0.1)', creditsMap));
        if (showCA) datasets.push(datasetFor("Chiffre d'Affaires (€)", '#f59e0b', 'rgba(245, 158, 11, 0.1)', caMap));
        if (showCommission) datasets.push(datasetFor('Commission (€)', '#10b981', 'rgba(16, 185, 129, 0.1)', commissionMap));

        // 6) Mettre à jour/initialiser le graphique
        if (!this.lineChart) {
            if (!this.lineChartCanvas?.nativeElement) return;
            this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
                type: 'line',
                data: { labels, datasets },
                options: this.lineChartConfig.options
            });
        } else {
            this.lineChart.data.labels = labels;
            this.lineChart.data.datasets = datasets as any;
        }

        // 7) Adapter l'échelle Y en fonction du max
        const allVals = datasets.flatMap(d => d.data as number[]);
        const maxVal = allVals.length ? Math.max(...allVals) : 0;
        const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.1) : 10;
        if (this.lineChart.options?.scales && (this.lineChart.options.scales as any)['y']) {
            (this.lineChart.options.scales as any)['y'].max = yMax;
        }

        this.lineChart.update();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (this.openDropdown) {
            this.openDropdown = null;
        }
    }
}
