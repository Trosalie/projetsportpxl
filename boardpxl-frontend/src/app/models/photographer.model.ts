export class Photographer {
    aws_sub!: string;
    email!: string;
    family_name!: string;
    given_name!: string;
    name!: string;
    customer_stripe_id!: string;
    nb_imported_photos!: number;
    total_limit!: number;
    fee_in_percent!: number;
    fix_fee!: number;
    street_address!: string;
    postal_code!: string;
    locality!: string;
    country!: string;
    iban!: string;
    password!: string;
    admin!: boolean

    constructor(aws_sub: string, email: string, family_name: string, given_name: string, name: string, customer_stripe_id: string, nb_imported_photos: number, total_limit: number, fee_in_percent: number, fix_fee: number, street_address: string, postal_code: string, locality: string, country: string, iban: string, password: string, admin: boolean)
    {
        this.aws_sub = aws_sub;
        this.email = email;
        this.family_name = family_name;
        this.given_name = given_name;
        this.name = name;
        this.customer_stripe_id = customer_stripe_id;
        this.nb_imported_photos = nb_imported_photos;
        this.total_limit = total_limit;
        this.fee_in_percent = fee_in_percent;
        this.fix_fee = fix_fee;
        this.street_address = street_address;
        this.postal_code = postal_code;
        this.locality = locality;
        this.country = country;
        this.iban = iban;
        this.password = password;
        this.admin = admin;
    }

}
