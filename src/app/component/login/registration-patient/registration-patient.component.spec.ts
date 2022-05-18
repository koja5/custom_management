import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPatientComponent } from './registration-patient.component';

describe('RegistrationPatientComponent', () => {
  let component: RegistrationPatientComponent;
  let fixture: ComponentFixture<RegistrationPatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationPatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
