import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographsList } from './photographs-list';

describe('PhotographsList', () => {
  let component: PhotographsList;
  let fixture: ComponentFixture<PhotographsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
