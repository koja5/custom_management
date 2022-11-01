import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTextFormComponent } from './dynamic-text-form.component';

describe('DynamicTextFormComponent', () => {
  let component: DynamicTextFormComponent;
  let fixture: ComponentFixture<DynamicTextFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicTextFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTextFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
