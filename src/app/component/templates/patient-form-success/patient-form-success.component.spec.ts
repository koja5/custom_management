import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFormSuccessComponent } from './patient-form-success.component';

describe('PatientFormSuccessComponent', () => {
  let component: PatientFormSuccessComponent;
  let fixture: ComponentFixture<PatientFormSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientFormSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientFormSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
