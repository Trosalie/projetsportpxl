import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceHistory } from './invoice-history';

describe('InvoiceHistory', () => {
  let component: InvoiceHistory;
  let fixture: ComponentFixture<InvoiceHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
