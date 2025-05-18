import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervenantDashboardComponent } from './intervenant-dashboard.component';

describe('IntervenantDashboardComponent', () => {
  let component: IntervenantDashboardComponent;
  let fixture: ComponentFixture<IntervenantDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntervenantDashboardComponent]
    });
    fixture = TestBed.createComponent(IntervenantDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
