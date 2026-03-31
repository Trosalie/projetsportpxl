export class InvoiceSubscription {
    number!: string;
    issueDate!: Date;
    dueDate!: Date;
    description!: string;
    amount!: number;
    tax!: number;
    vat!: number;
    reduction!: number;
    total_due!: number;
    start_period!: Date;
    end_period!: Date;
    link_pdf!: string;
    pdf_invoice_subject: any;
    status!: string;

    constructor(number: string, issueDate: Date, dueDate: Date, description: string, amount: number, tax: number, vat: number, reduction: number, total_due: number, start_period: Date, end_period: Date, link_pdf: string, pdf_invoice_subject: any, status: string) {
        this.number = number;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.amount = amount;
        this.tax = tax;
        this.vat = vat;
        this.reduction = reduction;
        this.total_due = total_due;
        this.start_period = start_period;
        this.end_period = end_period;
        this.link_pdf = link_pdf;
        this.pdf_invoice_subject = pdf_invoice_subject;
        this.status = status;
    }
}
