import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { EventType } from '../../../../core/models/event-type.enum';
import { FactoryEvent } from '../../../../core/models/event.model';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  const mockEvents: FactoryEvent[] = [
    {
      eventId: 'EVT-1001',
      eventType: EventType.PRODUCTION,
      description: 'Production line A started',
      timestamp: '2026-05-20T10:00:00'
    },
    {
      eventId: 'EVT-1002',
      eventType: EventType.QUALITY,
      description: 'Sensor failure on inspection station',
      timestamp: '2026-05-20T10:30:00'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when events list is empty and not loading', () => {
    fixture.componentRef.setInput('events', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('errorMessage', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.events-table')).toBeFalsy();
    expect(compiled.textContent).toContain('No Events Registered');
  });

  it('should display loading state when isLoading is true and events list is empty', () => {
    fixture.componentRef.setInput('events', []);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
    expect(compiled.textContent).toContain('Loading factory events...');
  });

  it('should display error state when errorMessage is provided and events list is empty', () => {
    const errorMsg = 'Unable to connect to the server';
    fixture.componentRef.setInput('events', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('errorMessage', errorMsg);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-state')).toBeTruthy();
    expect(compiled.textContent).toContain(errorMsg);
  });

  it('should render table rows when events are provided', () => {
    fixture.componentRef.setInput('events', mockEvents);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('errorMessage', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.event-row');
    expect(rows.length).toBe(2);

    expect(compiled.textContent).toContain('EVT-1001');
    expect(compiled.textContent).toContain('Production line A started');
    expect(compiled.textContent).toContain('PRODUCTION');

    expect(compiled.textContent).toContain('EVT-1002');
    expect(compiled.textContent).toContain('Sensor failure on inspection station');
    expect(compiled.textContent).toContain('QUALITY');
  });

  it('should emit refresh event when refresh button is clicked and not loading', () => {
    spyOn(component.refresh, 'emit');

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const refreshBtn: HTMLButtonElement = fixture.nativeElement.querySelector('#btn-refresh-events');
    refreshBtn.click();

    expect(component.refresh.emit).toHaveBeenCalled();
  });

  it('should not emit refresh event when isLoading is true', () => {
    spyOn(component.refresh, 'emit');

    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    component.onRefresh();

    expect(component.refresh.emit).not.toHaveBeenCalled();
  });
});
