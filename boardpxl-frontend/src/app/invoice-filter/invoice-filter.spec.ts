import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceFilter } from './invoice-filter';

describe('InvoiceFilter', () => {
  let component: InvoiceFilter;
  let fixture: ComponentFixture<InvoiceFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
