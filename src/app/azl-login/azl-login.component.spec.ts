import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzlLoginComponent } from './azl-login.component';

describe('AzlLoginComponent', () => {
  let component: AzlLoginComponent;
  let fixture: ComponentFixture<AzlLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzlLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AzlLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
