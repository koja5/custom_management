import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredClinicDetailComponent } from './registered-clinic-detail.component';

describe('RegisteredClinicDetailComponent', () => {
  let component: RegisteredClinicDetailComponent;
  let fixture: ComponentFixture<RegisteredClinicDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisteredClinicDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredClinicDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
