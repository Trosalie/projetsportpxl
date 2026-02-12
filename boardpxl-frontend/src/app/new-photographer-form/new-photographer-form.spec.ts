import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPhotographerForm } from './new-photographer-form';

describe('NewPhotographerForm', () => {
  let component: NewPhotographerForm;
  let fixture: ComponentFixture<NewPhotographerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewPhotographerForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPhotographerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
