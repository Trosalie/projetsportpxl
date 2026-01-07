import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGraph } from './test-graph';

describe('TestGraph', () => {
  let component: TestGraph;
  let fixture: ComponentFixture<TestGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestGraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestGraph);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
