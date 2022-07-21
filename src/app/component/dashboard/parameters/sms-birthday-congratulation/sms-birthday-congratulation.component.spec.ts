import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsBirthdayCongratulationComponent } from './sms-birthday-congratulation.component';

describe('SmsBirthdayCongratulationComponent', () => {
  let component: SmsBirthdayCongratulationComponent;
  let fixture: ComponentFixture<SmsBirthdayCongratulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsBirthdayCongratulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsBirthdayCongratulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
