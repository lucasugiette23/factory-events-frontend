import { EventType } from './event-type.enum';

export interface FactoryEvent {
  eventId: string;
  eventType: EventType;
  description: string;
  timestamp: string;
}

export interface CreateEventDto {
  eventId: string;
  eventType: EventType;
  description: string;
  timestamp: string;
}
