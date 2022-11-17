import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMultipleRecepientComponent } from './mail-multiple-recepient.component';

describe('MailMultipleRecepientComponent', () => {
  let component: MailMultipleRecepientComponent;
  let fixture: ComponentFixture<MailMultipleRecepientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailMultipleRecepientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailMultipleRecepientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
