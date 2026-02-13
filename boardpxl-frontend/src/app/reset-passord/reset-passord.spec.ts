import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPassord } from './reset-passord';

describe('ResetPassord', () => {
  let component: ResetPassord;
  let fixture: ComponentFixture<ResetPassord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPassord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
