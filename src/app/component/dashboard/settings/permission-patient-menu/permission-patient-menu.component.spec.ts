import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionPatientMenuComponent } from './permission-patient-menu.component';

describe('PermissionPatientMenuComponent', () => {
  let component: PermissionPatientMenuComponent;
  let fixture: ComponentFixture<PermissionPatientMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionPatientMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionPatientMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
