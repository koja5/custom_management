import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredClinicsComponent } from './registered-clinics.component';

describe('RegisteredClinicsComponent', () => {
  let component: RegisteredClinicsComponent;
  let fixture: ComponentFixture<RegisteredClinicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisteredClinicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredClinicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
