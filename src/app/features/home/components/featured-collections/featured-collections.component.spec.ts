import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedCollectionsComponent } from './featured-collections.component';

describe('FeaturedCollectionsComponent', () => {
  let component: FeaturedCollectionsComponent;
  let fixture: ComponentFixture<FeaturedCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCollectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
