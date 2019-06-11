import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDateComponent } from './base-date.component';

describe('BaseDateComponent', () => {
  let component: BaseDateComponent;
  let fixture: ComponentFixture<BaseDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
