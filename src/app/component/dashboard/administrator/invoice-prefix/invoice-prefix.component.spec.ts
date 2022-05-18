import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePrefixComponent } from './invoice-prefix.component';

describe('InvoicePrefixComponent', () => {
  let component: InvoicePrefixComponent;
  let fixture: ComponentFixture<InvoicePrefixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePrefixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePrefixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
