import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventsPageComponent } from './features/events/events-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EventsPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly appTitle = 'Factory Events Monitor';
}
