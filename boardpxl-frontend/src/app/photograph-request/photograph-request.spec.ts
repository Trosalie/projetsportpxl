import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographRequest } from './photograph-request';

describe('PhotographRequest', () => {
  let component: PhotographRequest;
  let fixture: ComponentFixture<PhotographRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
