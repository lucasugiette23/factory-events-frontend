import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { EventType } from '../../../../core/models/event-type.enum';
import { CreateEventDto } from '../../../../core/models/event.model';
import { noWhitespaceValidator } from '../../../../core/validators/no-whitespace.validator';
import {
  ensureApiDateTime,
  formatToApiDateTime
} from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() isSubmitting = false;
  @Output() readonly submitEvent = new EventEmitter<CreateEventDto>();

  readonly eventTypes = [
    { value: EventType.PRODUCTION, label: 'PRODUCTION' },
    { value: EventType.QUALITY, label: 'QUALITY' }
  ];

  eventForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initializes the reactive form with fields and validations.
   */
  private initForm(): void {
    this.eventForm = this.fb.group({
      eventId: [
        '',
        [Validators.required, noWhitespaceValidator(), Validators.maxLength(255)]
      ],
      eventType: [
        EventType.PRODUCTION,
        [Validators.required]
      ],
      description: [
        '',
        [Validators.required, noWhitespaceValidator(), Validators.maxLength(255)]
      ],
      timestamp: [
        formatToApiDateTime(),
        [Validators.required]
      ]
    });
  }

  /**
   * Helper getters for form controls to simplify template validation checks.
   */
  get eventIdControl() {
    return this.eventForm.get('eventId');
  }

  get eventTypeControl() {
    return this.eventForm.get('eventType');
  }

  get descriptionControl() {
    return this.eventForm.get('description');
  }

  get timestampControl() {
    return this.eventForm.get('timestamp');
  }

  /**
   * Submits the form data if valid and not already submitting.
   */
  onSubmit(): void {
    if (this.isSubmitting || this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formValues = this.eventForm.getRawValue();

    const payload: CreateEventDto = {
      eventId: String(formValues.eventId).trim(),
      eventType: formValues.eventType as EventType,
      description: String(formValues.description).trim(),
      timestamp: ensureApiDateTime(formValues.timestamp)
    };

    this.submitEvent.emit(payload);
  }

  /**
   * Resets the form fields and reinitializes timestamp with current local time.
   */
  resetForm(): void {
    this.eventForm.reset({
      eventId: '',
      eventType: EventType.PRODUCTION,
      description: '',
      timestamp: formatToApiDateTime()
    });
  }
}
