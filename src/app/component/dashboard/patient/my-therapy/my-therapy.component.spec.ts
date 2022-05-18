import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTherapyComponent } from './my-therapy.component';

describe('MyTherapyComponent', () => {
  let component: MyTherapyComponent;
  let fixture: ComponentFixture<MyTherapyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTherapyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTherapyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
