import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSchedulerComponent } from './dynamic-scheduler.component';

describe('DynamicSchedulerComponent', () => {
  let component: DynamicSchedulerComponent;
  let fixture: ComponentFixture<DynamicSchedulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSchedulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
