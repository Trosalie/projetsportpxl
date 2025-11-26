import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaching } from './test-caching';

describe('TestCaching', () => {
  let component: TestCaching;
  let fixture: ComponentFixture<TestCaching>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestCaching]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaching);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
