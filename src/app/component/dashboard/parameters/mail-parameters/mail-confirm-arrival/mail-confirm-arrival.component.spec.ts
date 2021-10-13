import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailConfirmArrivalComponent } from './mail-confirm-arrival.component';

describe('MailConfirmArrivalComponent', () => {
  let component: MailConfirmArrivalComponent;
  let fixture: ComponentFixture<MailConfirmArrivalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailConfirmArrivalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailConfirmArrivalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
