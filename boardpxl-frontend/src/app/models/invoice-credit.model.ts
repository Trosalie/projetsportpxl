export class InvoiceCredit {
    number!: string;
    issueDate!: Date;
    dueDate!: Date;
    description!: string;
    amount!: number;
    tax!: number;
    vat!: number;
    totalDue!: number;
    credits!: number;
    status!: string;
    link_pdf!: string;

    constructor(number: string, issueDate: Date, dueDate: Date, description: string, amount: number, tax: number, vat: number, totalDue: number, credits: number, status: string, link_pdf: string) {
        this.number = number;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.amount = amount;
        this.tax = tax;
        this.vat = vat;
        this.totalDue = totalDue;
        this.credits = credits;
        this.status = status;
        this.link_pdf = link_pdf;
    }
}
