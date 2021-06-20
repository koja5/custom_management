import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemWarnComponent } from './system-warn.component';

describe('SystemWarnComponent', () => {
  let component: SystemWarnComponent;
  let fixture: ComponentFixture<SystemWarnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemWarnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemWarnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
