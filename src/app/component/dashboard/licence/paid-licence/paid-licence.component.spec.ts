import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidLicenceComponent } from './paid-licence.component';

describe('PaidLicenceComponent', () => {
  let component: PaidLicenceComponent;
  let fixture: ComponentFixture<PaidLicenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaidLicenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaidLicenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
