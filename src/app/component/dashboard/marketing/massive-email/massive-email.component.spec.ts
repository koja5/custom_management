import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveEmailComponent } from './massive-email.component';

describe('MassiveEmailComponent', () => {
  let component: MassiveEmailComponent;
  let fixture: ComponentFixture<MassiveEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
