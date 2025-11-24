import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerCard } from './photographer-card';

describe('PhotographerCard', () => {
  let component: PhotographerCard;
  let fixture: ComponentFixture<PhotographerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographerCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
