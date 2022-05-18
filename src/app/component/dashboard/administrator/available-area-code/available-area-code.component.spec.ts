import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableAreaCodeComponent } from './available-area-code.component';

describe('AvailableAreaCodeComponent', () => {
  let component: AvailableAreaCodeComponent;
  let fixture: ComponentFixture<AvailableAreaCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableAreaCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableAreaCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
