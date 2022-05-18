import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmArrivalComponent } from './confirm-arrival.component';

describe('ConfirmArrivalComponent', () => {
  let component: ConfirmArrivalComponent;
  let fixture: ComponentFixture<ConfirmArrivalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmArrivalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmArrivalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
