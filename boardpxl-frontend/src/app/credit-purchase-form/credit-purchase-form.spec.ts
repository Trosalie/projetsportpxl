import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditPurchaseForm } from './credit-purchase-form';

describe('CreditPurchaseForm', () => {
  let component: CreditPurchaseForm;
  let fixture: ComponentFixture<CreditPurchaseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditPurchaseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditPurchaseForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
