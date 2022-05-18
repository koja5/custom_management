import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSendSmsComponent } from './dynamic-send-sms.component';

describe('DynamicSendSmsComponent', () => {
  let component: DynamicSendSmsComponent;
  let fixture: ComponentFixture<DynamicSendSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSendSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSendSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
