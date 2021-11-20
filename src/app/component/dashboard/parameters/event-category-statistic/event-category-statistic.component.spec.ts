import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCategoryStatisticComponent } from './event-category-statistic.component';

describe('EventCategoryStatisticComponent', () => {
  let component: EventCategoryStatisticComponent;
  let fixture: ComponentFixture<EventCategoryStatisticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventCategoryStatisticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCategoryStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
