import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsToHandleComponent } from './tickets-to-handle.component';

describe('TicketsToHandleComponent', () => {
  let component: TicketsToHandleComponent;
  let fixture: ComponentFixture<TicketsToHandleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsToHandleComponent]
    });
    fixture = TestBed.createComponent(TicketsToHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
