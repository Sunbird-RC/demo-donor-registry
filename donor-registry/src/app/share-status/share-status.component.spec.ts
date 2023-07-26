import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStatusComponent } from './share-status.component';

describe('ShareStatusComponent', () => {
  let component: ShareStatusComponent;
  let fixture: ComponentFixture<ShareStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
