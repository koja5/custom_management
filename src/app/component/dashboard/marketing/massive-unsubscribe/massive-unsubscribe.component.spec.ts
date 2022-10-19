import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveUnsubscribeComponent } from './massive-unsubscribe.component';

describe('MassiveUnsubscribeComponent', () => {
  let component: MassiveUnsubscribeComponent;
  let fixture: ComponentFixture<MassiveUnsubscribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveUnsubscribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveUnsubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
