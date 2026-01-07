import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoverPaymentForm } from './turnover-payment-form';

describe('TurnoverPaymentForm', () => {
  let component: TurnoverPaymentForm;
  let fixture: ComponentFixture<TurnoverPaymentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnoverPaymentForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnoverPaymentForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
