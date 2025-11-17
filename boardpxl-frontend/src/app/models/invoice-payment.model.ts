export class InvoicePayment {
    number!: string;
    issueDate!: Date;
    dueDate!: Date;
    description!: string;
    turnover!: number;
    raw_value!: number;
    commission!: number;
    tax!: number;
    vat!: number;
    start_period!: Date;
    end_period!: Date;
    link_pdf!: string;
    name_pdf: any;

    constructor(number: string, issueDate: Date, dueDate: Date, description: string, turnover: number, raw_value: number, commission: number, tax: number, vat: number, start_period: Date, end_period: Date, link_pdf: string, name_pdf: any) {
        this.number = number;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.turnover = turnover;
        this.raw_value = raw_value;
        this.commission = commission;
        this.tax = tax;
        this.vat = vat;
        this.start_period = start_period;
        this.end_period = end_period;
        this.link_pdf = link_pdf;
        this.name_pdf = name_pdf;
    }
}