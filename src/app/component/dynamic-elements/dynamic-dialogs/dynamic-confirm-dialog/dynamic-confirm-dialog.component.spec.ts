import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicConfirmDialogComponent } from './dynamic-confirm-dialog.component';

describe('DynamicConfirmDialogComponent', () => {
  let component: DynamicConfirmDialogComponent;
  let fixture: ComponentFixture<DynamicConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
