import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeColorsComponent } from './theme-colors.component';

describe('ThemeColorsComponent', () => {
  let component: ThemeColorsComponent;
  let fixture: ComponentFixture<ThemeColorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeColorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
