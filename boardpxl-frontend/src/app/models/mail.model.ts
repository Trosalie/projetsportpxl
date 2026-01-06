export class Mail {
    to!: string;
    sender_id!: number;
    from!: string;
    recipient!: string;
    subject!: string;
    body!: string;
    type!: string;
    status!: string;
    created_at!: Date;

    constructor(to: string, sender_id: number, from: string, subject: string, body: string, type: string, created_at: Date) {
        this.to = to;
        this.sender_id = sender_id;
        this.from = from;
        this.subject = subject;
        this.body = body;
        this.type = type;
        this.created_at = created_at;
    }
}
