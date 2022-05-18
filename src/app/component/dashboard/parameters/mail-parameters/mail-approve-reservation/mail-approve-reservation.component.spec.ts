import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailApproveReservationComponent } from './mail-approve-reservation.component';

describe('MailApproveReservationComponent', () => {
  let component: MailApproveReservationComponent;
  let fixture: ComponentFixture<MailApproveReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailApproveReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailApproveReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
