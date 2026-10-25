import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { EventsPageComponent } from './events-page.component';
import { EventService } from '../../core/services/event.service';
import { EventType } from '../../core/models/event-type.enum';
import { FactoryEvent, CreateEventDto } from '../../core/models/event.model';

describe('EventsPageComponent', () => {
  let component: EventsPageComponent;
  let fixture: ComponentFixture<EventsPageComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;

  const mockEvents: FactoryEvent[] = [
    {
      eventId: 'EVT-1001',
      eventType: EventType.PRODUCTION,
      description: 'Stamping unit operational',
      timestamp: '2026-05-20T10:00:00'
    },
    {
      eventId: 'EVT-1002',
      eventType: EventType.QUALITY,
      description: 'Tolerance variation on sheet metal',
      timestamp: '2026-05-20T10:15:00'
    }
  ];

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj<EventService>('EventService', [
      'getEvents',
      'createEvent'
    ]);

    // Default mock behavior
    eventServiceSpy.getEvents.and.returnValue(of(mockEvents));
    eventServiceSpy.createEvent.and.returnValue(of(mockEvents[0]));

    await TestBed.configureTestingModule({
      imports: [EventsPageComponent],
      providers: [{ provide: EventService, useValue: eventServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(EventsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization (GET /api/events)', () => {
    it('should load factory events on component initialization', () => {
      fixture.detectChanges(); // triggers ngOnInit

      expect(eventServiceSpy.getEvents).toHaveBeenCalledTimes(1);
      expect(component.events.length).toBe(2);
      expect(component.events).toEqual(mockEvents);
      expect(component.isLoadingEvents).toBeFalse();
      expect(component.eventsError).toBeNull();
    });

    it('should display error message when API fails to load events with 500 error', () => {
      eventServiceSpy.getEvents.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' }))
      );

      fixture.detectChanges();

      expect(component.eventsError).toBe('Internal server error. Please try again later.');
      expect(component.isLoadingEvents).toBeFalse();
    });

    it('should display connection failure message when server is unreachable (status 0)', () => {
      eventServiceSpy.getEvents.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }))
      );

      fixture.detectChanges();

      expect(component.eventsError).toBe('Unable to connect to the server.');
      expect(component.isLoadingEvents).toBeFalse();
    });
  });

  describe('Event Registration (POST /api/events)', () => {
    const newDto: CreateEventDto = {
      eventId: 'EVT-2001',
      eventType: EventType.PRODUCTION,
      description: 'Conveyor belt speed calibrated',
      timestamp: '2026-05-20T11:00:00'
    };

    beforeEach(() => {
      fixture.detectChanges(); // initial load
    });

    it('should update events list and show success message after successful registration', fakeAsync(() => {
      const createdEvent: FactoryEvent = { ...newDto };
      eventServiceSpy.createEvent.and.returnValue(of(createdEvent));

      // Subsequent getEvents will return updated list
      eventServiceSpy.getEvents.and.returnValue(of([...mockEvents, createdEvent]));

      component.onRegisterEvent(newDto);
      tick();
      fixture.detectChanges();

      expect(eventServiceSpy.createEvent).toHaveBeenCalledWith(newDto);
      expect(component.successMessage).toBe('Event registered successfully.');
      expect(component.isSubmitting).toBeFalse();
      expect(eventServiceSpy.getEvents).toHaveBeenCalledTimes(2); // onInit + after create
      expect(component.events.length).toBe(3);
    }));

    it('should use a generic conflict message when no problem code is supplied', fakeAsync(() => {
      const conflictError = new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',
        error: 'Event ID already exists'
      });
      eventServiceSpy.createEvent.and.returnValue(throwError(() => conflictError));

      component.onRegisterEvent(newDto);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('The event could not be saved due to a data conflict.');
      expect(component.successMessage).toBeNull();
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should show the backend duplicate event message', () => {
      eventServiceSpy.createEvent.and.returnValue(throwError(() => new HttpErrorResponse({
        status: 409,
        error: { code: 'DUPLICATE_EVENT', detail: 'Já existe um evento registrado com este eventId.' }
      })));
      component.onRegisterEvent(newDto);
      fixture.detectChanges();
      expect(component.errorMessage).toBe('Já existe um evento registrado com este eventId.');
      expect(fixture.nativeElement.querySelector('.alert-danger').textContent)
        .toContain('Já existe um evento registrado com este eventId.');
    });

    it('should distinguish other integrity conflicts from duplicate events', () => {
      eventServiceSpy.createEvent.and.returnValue(throwError(() => new HttpErrorResponse({
        status: 409, error: { code: 'DATA_INTEGRITY_ERROR', detail: 'Os dados violam uma restrição de integridade.' }
      })));
      component.onRegisterEvent(newDto);
      expect(component.errorMessage).toBe('Os dados violam uma restrição de integridade.');
    });

    it('should display backend validation details and field messages', () => {
      eventServiceSpy.createEvent.and.returnValue(throwError(() => new HttpErrorResponse({
        status: 400,
        error: { code: 'VALIDATION_ERROR', detail: 'Existem campos inválidos.',
          errors: [{ field: 'description', message: 'A descrição deve ter no máximo 255 caracteres.' }] }
      })));
      component.onRegisterEvent(newDto);
      expect(component.errorMessage).toContain('Existem campos inválidos.');
      expect(component.errorMessage).toContain('description: A descrição deve ter no máximo 255 caracteres.');
    });

    it('should fall back safely for malformed error responses', () => {
      eventServiceSpy.createEvent.and.returnValue(throwError(() => new HttpErrorResponse({
        status: 500, error: { detail: 'Private SQL stack trace', errors: 'invalid' }
      })));
      component.onRegisterEvent(newDto);
      expect(component.errorMessage).toBe('Internal server error. Please try again later.');
    });

    it('should handle HTTP 400 bad request and display invalid data message', fakeAsync(() => {
      const badRequestError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request'
      });
      eventServiceSpy.createEvent.and.returnValue(throwError(() => badRequestError));

      component.onRegisterEvent(newDto);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Invalid event data. Please verify the submitted fields.');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle server connection error (status 0) during registration', fakeAsync(() => {
      const connectionError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      });
      eventServiceSpy.createEvent.and.returnValue(throwError(() => connectionError));

      component.onRegisterEvent(newDto);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Unable to connect to the server.');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle HTTP 500 error during registration', fakeAsync(() => {
      const serverError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });
      eventServiceSpy.createEvent.and.returnValue(throwError(() => serverError));

      component.onRegisterEvent(newDto);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Internal server error. Please try again later.');
      expect(component.isSubmitting).toBeFalse();
    }));
  });

  describe('Alert Dismissal', () => {
    it('should clear success message when dismissed', () => {
      component.successMessage = 'Success';
      component.dismissAlert('success');
      expect(component.successMessage).toBeNull();
    });

    it('should clear error message when dismissed', () => {
      component.errorMessage = 'Error';
      component.dismissAlert('error');
      expect(component.errorMessage).toBeNull();
    });
  });
});
