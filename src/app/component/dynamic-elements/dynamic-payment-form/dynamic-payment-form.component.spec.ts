import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicPaymentFormComponent } from './dynamic-payment-form.component';

describe('DynamicPaymentFormComponent', () => {
  let component: DynamicPaymentFormComponent;
  let fixture: ComponentFixture<DynamicPaymentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicPaymentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
