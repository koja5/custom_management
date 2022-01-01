import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsMassiveComponent } from './sms-massive.component';

describe('SmsMassiveComponent', () => {
  let component: SmsMassiveComponent;
  let fixture: ComponentFixture<SmsMassiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsMassiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsMassiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
