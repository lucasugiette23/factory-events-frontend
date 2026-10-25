import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventFormComponent } from './event-form.component';
import { EventType } from '../../../../core/models/event-type.enum';
import { CreateEventDto } from '../../../../core/models/event.model';

describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.eventForm).toBeDefined();
    expect(component.eventForm.get('eventType')?.value).toBe(EventType.PRODUCTION);
    expect(component.eventForm.get('timestamp')?.value).toBeTruthy();
    expect(component.eventForm.get('eventId')?.value).toBe('');
    expect(component.eventForm.get('description')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const eventIdControl = component.eventIdControl;
      const descriptionControl = component.descriptionControl;
      const timestampControl = component.timestampControl;

      eventIdControl?.setValue('');
      descriptionControl?.setValue('');
      timestampControl?.setValue('');

      expect(eventIdControl?.hasError('required')).toBeTrue();
      expect(descriptionControl?.hasError('required')).toBeTrue();
      expect(timestampControl?.hasError('required')).toBeTrue();
      expect(component.eventForm.invalid).toBeTrue();
    });

    it('should invalidate fields containing only whitespace', () => {
      const eventIdControl = component.eventIdControl;
      const descriptionControl = component.descriptionControl;

      eventIdControl?.setValue('   ');
      descriptionControl?.setValue('   \t  ');

      expect(eventIdControl?.hasError('whitespace')).toBeTrue();
      expect(descriptionControl?.hasError('whitespace')).toBeTrue();
      expect(component.eventForm.invalid).toBeTrue();
    });

    it('should accept the 255-character limit and reject longer values', () => {
      component.eventForm.patchValue({ eventId: 'x'.repeat(255), description: 'x'.repeat(255) });
      expect(component.eventForm.valid).toBeTrue();
      component.eventIdControl?.setValue('x'.repeat(256));
      component.descriptionControl?.setValue('x'.repeat(256));
      component.eventForm.markAllAsTouched();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(component.eventIdControl?.hasError('maxlength')).toBeTrue();
      expect(component.descriptionControl?.hasError('maxlength')).toBeTrue();
      expect(fixture.nativeElement.querySelector('#eventId-error').textContent)
        .toContain('Event ID must have at most 255 characters.');
      expect(fixture.nativeElement.querySelector('#description-error').textContent)
        .toContain('Description must have at most 255 characters.');
      expect(fixture.nativeElement.querySelector('#btn-register-event').disabled).toBeTrue();
      spyOn(component.submitEvent, 'emit');
      component.onSubmit();
      expect(component.submitEvent.emit).not.toHaveBeenCalled();
    });

    it('should be valid when all required fields have valid content', () => {
      component.eventForm.setValue({
        eventId: 'EVT-101',
        eventType: EventType.QUALITY,
        description: 'Vibration detected on motor 2',
        timestamp: '2026-05-20T14:30:00'
      });

      expect(component.eventForm.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission when form is invalid', () => {
      spyOn(component.submitEvent, 'emit');

      component.eventForm.patchValue({
        eventId: '',
        description: ''
      });

      component.onSubmit();

      expect(component.submitEvent.emit).not.toHaveBeenCalled();
      expect(component.eventForm.touched).toBeTrue();
    });

    it('should emit valid and trimmed payload when form is submitted', () => {
      spyOn(component.submitEvent, 'emit');

      component.eventForm.setValue({
        eventId: '  EVT-202  ',
        eventType: EventType.QUALITY,
        description: '  Temperature exceeded threshold  ',
        timestamp: '2026-05-20T10:00:00'
      });

      component.onSubmit();

      const expectedPayload: CreateEventDto = {
        eventId: 'EVT-202',
        eventType: EventType.QUALITY,
        description: 'Temperature exceeded threshold',
        timestamp: '2026-05-20T10:00:00'
      };

      expect(component.submitEvent.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should prevent duplicate submission when isSubmitting is true', () => {
      spyOn(component.submitEvent, 'emit');

      component.eventForm.setValue({
        eventId: 'EVT-303',
        eventType: EventType.PRODUCTION,
        description: 'Shift started',
        timestamp: '2026-05-20T08:00:00'
      });

      component.isSubmitting = true;
      fixture.detectChanges();

      component.onSubmit();

      expect(component.submitEvent.emit).not.toHaveBeenCalled();
    });

    it('should disable submit button when form is invalid or when isSubmitting is true', () => {
      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('#btn-register-event');
      expect(submitBtn.disabled).toBeTrue();

      component.eventForm.setValue({
        eventId: 'EVT-404',
        eventType: EventType.PRODUCTION,
        description: 'Line maintenance completed',
        timestamp: '2026-05-20T09:00:00'
      });
      fixture.detectChanges();

      expect(submitBtn.disabled).toBeFalse();

      fixture.componentRef.setInput('isSubmitting', true);
      fixture.detectChanges();

      expect(submitBtn.disabled).toBeTrue();
    });
  });

  describe('Form Reset', () => {
    it('should reset the form and reinitialize the timestamp', () => {
      component.eventForm.setValue({
        eventId: 'EVT-505',
        eventType: EventType.QUALITY,
        description: 'Inspection failure',
        timestamp: '2026-05-20T12:00:00'
      });

      component.resetForm();

      expect(component.eventForm.get('eventId')?.value).toBe('');
      expect(component.eventForm.get('description')?.value).toBe('');
      expect(component.eventForm.get('eventType')?.value).toBe(EventType.PRODUCTION);
      expect(component.eventForm.get('timestamp')?.value).toBeTruthy();
    });
  });
});
