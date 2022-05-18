import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSendEmailComponent } from './dynamic-send-email.component';

describe('DynamicSendEmailComponent', () => {
  let component: DynamicSendEmailComponent;
  let fixture: ComponentFixture<DynamicSendEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSendEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
