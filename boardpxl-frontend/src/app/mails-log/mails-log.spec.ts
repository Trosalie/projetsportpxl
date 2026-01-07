import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailsLog } from './mails-log';

describe('MailsLog', () => {
  let component: MailsLog;
  let fixture: ComponentFixture<MailsLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MailsLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailsLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
