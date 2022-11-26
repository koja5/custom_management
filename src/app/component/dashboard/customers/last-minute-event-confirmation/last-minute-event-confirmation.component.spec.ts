import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastMinuteEventConfirmationComponent } from './last-minute-event-confirmation.component';

describe('LastMinuteEventConfirmationComponent', () => {
  let component: LastMinuteEventConfirmationComponent;
  let fixture: ComponentFixture<LastMinuteEventConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastMinuteEventConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastMinuteEventConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
