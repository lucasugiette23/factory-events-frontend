import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FactoryEvent } from '../../../../core/models/event.model';
import { EventType } from '../../../../core/models/event-type.enum';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent {
  @Input() events: FactoryEvent[] = [];
  @Input() isLoading = false;
  @Input() errorMessage: string | null = null;

  @Output() readonly refresh = new EventEmitter<void>();

  readonly EventType = EventType;

  /**
   * Triggers manual list refresh.
   */
  onRefresh(): void {
    if (!this.isLoading) {
      this.refresh.emit();
    }
  }
}
