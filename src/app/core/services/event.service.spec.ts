import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { EventType } from '../models/event-type.enum';
import { FactoryEvent, CreateEventDto } from '../models/event.model';
import { environment } from '../../../environments/environment';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  const mockEvents: FactoryEvent[] = [
    {
      eventId: 'EVT-1001',
      eventType: EventType.PRODUCTION,
      description: 'Production line 1 started',
      timestamp: '2026-05-20T10:00:00'
    },
    {
      eventId: 'EVT-1002',
      eventType: EventType.QUALITY,
      description: 'Defect rate exceeded threshold',
      timestamp: '2026-05-20T10:15:00'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform GET request and return events list', () => {
    service.getEvents().subscribe((events) => {
      expect(events.length).toBe(2);
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should perform POST request with correct payload and return created event', () => {
    const newEventDto: CreateEventDto = {
      eventId: 'EVT-1003',
      eventType: EventType.PRODUCTION,
      description: 'Conveyor belt speed adjusted',
      timestamp: '2026-05-20T11:00:00'
    };

    const createdEventResponse: FactoryEvent = { ...newEventDto };

    service.createEvent(newEventDto).subscribe((created) => {
      expect(created).toEqual(createdEventResponse);
    });

    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEventDto);
    req.flush(createdEventResponse, { status: 201, statusText: 'Created' });
  });

  it('should handle HTTP error appropriately', () => {
    const newEventDto: CreateEventDto = {
      eventId: 'EVT-1001',
      eventType: EventType.PRODUCTION,
      description: 'Duplicate event test',
      timestamp: '2026-05-20T10:00:00'
    };

    service.createEvent(newEventDto).subscribe({
      next: () => fail('Should have failed with 409 error'),
      error: (error) => {
        expect(error.status).toBe(409);
      }
    });

    const req = httpMock.expectOne(environment.apiUrl);
    req.flush('This event has already been registered', { status: 409, statusText: 'Conflict' });
  });
});
