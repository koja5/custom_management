import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailMassiveEmailComponent } from './mail-massive-email.component';

describe('MailMassiveEmailComponent', () => {
  let component: MailMassiveEmailComponent;
  let fixture: ComponentFixture<MailMassiveEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailMassiveEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailMassiveEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
