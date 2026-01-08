import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list';

describe('AdminPhotographerInvoiceList', () => {
  let component: AdminPhotographerInvoiceList;
  let fixture: ComponentFixture<AdminPhotographerInvoiceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPhotographerInvoiceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPhotographerInvoiceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
