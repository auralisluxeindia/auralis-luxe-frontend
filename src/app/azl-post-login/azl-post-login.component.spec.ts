import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzlPostLoginComponent } from './azl-post-login.component';

describe('AzlPostLoginComponent', () => {
  let component: AzlPostLoginComponent;
  let fixture: ComponentFixture<AzlPostLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzlPostLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AzlPostLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
