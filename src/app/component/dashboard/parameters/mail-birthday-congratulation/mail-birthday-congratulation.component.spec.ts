import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailBirthdayCongratulationComponent } from './mail-birthday-congratulation.component';

describe('MailBirthdayCongratulationComponent', () => {
  let component: MailBirthdayCongratulationComponent;
  let fixture: ComponentFixture<MailBirthdayCongratulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailBirthdayCongratulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailBirthdayCongratulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
