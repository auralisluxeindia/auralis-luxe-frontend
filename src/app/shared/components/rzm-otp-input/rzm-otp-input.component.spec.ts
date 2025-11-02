import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RzmOtpInputComponent } from './rzm-otp-input.component';

describe('RzmOtpInputComponent', () => {
  let component: RzmOtpInputComponent;
  let fixture: ComponentFixture<RzmOtpInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RzmOtpInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RzmOtpInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
