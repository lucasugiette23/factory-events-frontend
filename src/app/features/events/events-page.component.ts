import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService } from '../../core/services/event.service';
import { FactoryEvent, CreateEventDto } from '../../core/models/event.model';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { parseApiProblem } from '../../core/utils/api-problem.utils';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, EventFormComponent, EventListComponent],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(EventFormComponent) eventFormComponent?: EventFormComponent;

  events: FactoryEvent[] = [];
  isLoadingEvents = false;
  isSubmitting = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;
  eventsError: string | null = null;

  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Fetches events from the backend service.
   */
  loadEvents(): void {
    this.isLoadingEvents = true;
    this.eventsError = null;
    this.cdr.markForCheck();

    this.eventService
      .getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.isLoadingEvents = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingEvents = false;
          this.eventsError = this.resolveErrorMessage(error, 'load');
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Orchestrates the registration of a new event.
   */
  onRegisterEvent(dto: CreateEventDto): void {
    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.eventService
      .createEvent(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Event registered successfully.';
          this.eventFormComponent?.resetForm();
          this.loadEvents();
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.errorMessage = this.resolveErrorMessage(error, 'submit');
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Resolves HTTP errors into safe, user-friendly messages.
   * Shields internal details and stack traces.
   */
  private resolveErrorMessage(error: HttpErrorResponse, context: 'submit' | 'load'): string {
    if (error.status === 0) {
      return 'Unable to connect to the server.';
    }

    const problem = parseApiProblem(error.error);
    if (problem) {
      const fieldMessages = problem.code === 'VALIDATION_ERROR'
        ? problem.errors.map(fieldError => `${fieldError.field}: ${fieldError.message}`)
        : [];
      const messages = [problem.detail, ...fieldMessages].filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' ');
      }
      if (problem.code === 'DUPLICATE_EVENT') {
        return 'This event has already been registered.';
      }
      if (problem.code === 'DATA_INTEGRITY_ERROR') {
        return 'The event could not be saved because its data conflicts with existing records.';
      }
    }

    if (context === 'submit') {
      if (error.status === 409) {
        return 'The event could not be saved due to a data conflict.';
      }
      if (error.status === 400) {
        return 'Invalid event data. Please verify the submitted fields.';
      }
      if (error.status >= 500) {
        return 'Internal server error. Please try again later.';
      }
      return 'Unable to register event. Please try again.';
    }

    if (error.status >= 500) {
      return 'Internal server error. Please try again later.';
    }

    return 'Failed to load events from the server.';
  }

  dismissAlert(type: 'success' | 'error'): void {
    if (type === 'success') {
      this.successMessage = null;
    } else {
      this.errorMessage = null;
    }
    this.cdr.markForCheck();
  }
}
