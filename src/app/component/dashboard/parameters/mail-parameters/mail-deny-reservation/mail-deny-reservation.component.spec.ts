import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailDenyReservationComponent } from './mail-deny-reservation.component';

describe('MailDenyReservationComponent', () => {
  let component: MailDenyReservationComponent;
  let fixture: ComponentFixture<MailDenyReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailDenyReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailDenyReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
