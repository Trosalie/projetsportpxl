import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPhotographerForm } from './edit-photographer-form';

describe('EditPhotographerForm', () => {
  let component: EditPhotographerForm;
  let fixture: ComponentFixture<EditPhotographerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPhotographerForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPhotographerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
