import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailRequestPage } from './mail-request-page';

describe('MailRequestPage', () => {
  let component: MailRequestPage;
  let fixture: ComponentFixture<MailRequestPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailRequestPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
