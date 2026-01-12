export class InvoiceCredit {
    number!: string;
    issueDate!: Date;
    dueDate!: Date;
    amount!: number;
    tax!: number;
    vat!: number;
    totalDue!: number;
    credits!: number;
    status!: string;
    link_pdf!: string;
    pdf_invoice_subject!: string;

    constructor(number: string, issueDate: Date, dueDate: Date, amount: number, tax: number, vat: number, totalDue: number, credits: number, status: string, link_pdf: string, pdf_invoice_subject: string) {
        this.number = number;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.amount = amount;
        this.tax = tax;
        this.vat = vat;
        this.totalDue = totalDue;
        this.credits = credits;
        this.status = status;
        this.link_pdf = link_pdf;
        this.pdf_invoice_subject = pdf_invoice_subject;
    }
}
