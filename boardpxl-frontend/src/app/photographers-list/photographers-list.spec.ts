import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographersList } from './photographers-list';

describe('PhotographersList', () => {
  let component: PhotographersList;
  let fixture: ComponentFixture<PhotographersList>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
