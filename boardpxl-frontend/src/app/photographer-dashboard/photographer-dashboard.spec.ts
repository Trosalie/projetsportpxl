import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographDashboard } from './photograph-dashboard';

describe('PhotographDashboard', () => {
  let component: PhotographDashboard;
  let fixture: ComponentFixture<PhotographDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
