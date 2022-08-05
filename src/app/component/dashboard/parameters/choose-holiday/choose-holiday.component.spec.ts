import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseHolidayComponent } from './choose-holiday.component';

describe('ChooseHolidayComponent', () => {
  let component: ChooseHolidayComponent;
  let fixture: ComponentFixture<ChooseHolidayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseHolidayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
