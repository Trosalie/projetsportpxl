import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticResponse } from './automatic-response';

describe('AutomaticResponse', () => {
  let component: AutomaticResponse;
  let fixture: ComponentFixture<AutomaticResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutomaticResponse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomaticResponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
