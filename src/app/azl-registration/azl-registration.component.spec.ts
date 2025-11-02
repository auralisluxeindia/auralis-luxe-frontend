import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzlRegistrationComponent } from './azl-registration.component';

describe('AzlRegistrationComponent', () => {
  let component: AzlRegistrationComponent;
  let fixture: ComponentFixture<AzlRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzlRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AzlRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
