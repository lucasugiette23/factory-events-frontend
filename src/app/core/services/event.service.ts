import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FactoryEvent, CreateEventDto } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Fetches the list of all factory events from the backend.
   */
  getEvents(): Observable<FactoryEvent[]> {
    return this.http.get<FactoryEvent[]>(this.apiUrl);
  }

  /**
   * Registers a new factory event with the backend.
   * @param event The event payload to create.
   */
  createEvent(event: CreateEventDto): Observable<FactoryEvent> {
    return this.http.post<FactoryEvent>(this.apiUrl, event);
  }
}
