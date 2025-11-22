import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerRequest } from './photographer-request';

describe('PhotographerRequest', () => {
  let component: PhotographerRequest;
  let fixture: ComponentFixture<PhotographerRequest>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographerRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
