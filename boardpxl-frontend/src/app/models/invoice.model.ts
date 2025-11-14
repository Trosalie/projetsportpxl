export class Invoice {
    number!: string;
    issueDate!: Date;
    dueDate!: Date;
    description!: string;
    tax!: number;
    vat!: number;
    link_pdf!: string;
    invoice_lines!: string;

    constructor(number: string, issueDate: Date, dueDate: Date, description: string, tax: number, vat: number, link_pdf: string, invoice_lines: string) {
        this.number = number;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.description = description;
        this.tax = tax;
        this.vat = vat;
        this.link_pdf = link_pdf;
        this.invoice_lines = invoice_lines;
    }

}
