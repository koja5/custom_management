import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveSmsComponent } from './massive-sms.component';

describe('MassiveSmsComponent', () => {
  let component: MassiveSmsComponent;
  let fixture: ComponentFixture<MassiveSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
