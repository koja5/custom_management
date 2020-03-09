import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeColorsComponent } from './work-time-colors.component';

describe('WorkTimeColorsComponent', () => {
  let component: WorkTimeColorsComponent;
  let fixture: ComponentFixture<WorkTimeColorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTimeColorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTimeColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
