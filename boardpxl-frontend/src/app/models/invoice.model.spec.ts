import { Invoice } from './invoice.model';

describe('Invoice', () => {
  it('should create an instance', () => {
    // Provide 8 mock parameters for the Invoice constructor
    const invoice = new Invoice(
      'INV-001',         // id
      'Customer Name',   // customerName
      new Date(),        // date
     100.0,             // amount
     'USD',             // currency
     'Pending',         // status
     [],                // items
     'Notes'            // notes
   );
   expect(invoice).toBeTruthy();
 });
});
