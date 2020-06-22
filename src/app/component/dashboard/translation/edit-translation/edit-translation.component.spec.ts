import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTranslationComponent } from './edit-translation.component';

describe('EditTranslationComponent', () => {
  let component: EditTranslationComponent;
  let fixture: ComponentFixture<EditTranslationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTranslationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
