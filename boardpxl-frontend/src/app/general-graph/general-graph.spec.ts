import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralGraph } from './general-graph';

describe('GeneralGraph', () => {
  let component: GeneralGraph;
  let fixture: ComponentFixture<GeneralGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralGraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralGraph);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
