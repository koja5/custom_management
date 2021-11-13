import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSuperadminProfileComponent } from './change-superadmin-profile.component';

describe('ChangeSuperadminProfileComponent', () => {
  let component: ChangeSuperadminProfileComponent;
  let fixture: ComponentFixture<ChangeSuperadminProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSuperadminProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSuperadminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
