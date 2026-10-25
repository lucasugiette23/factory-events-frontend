import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { EventService } from './core/services/event.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj<EventService>('EventService', [
      'getEvents',
      'createEvent'
    ]);
    eventServiceSpy.getEvents.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: EventService, useValue: eventServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have title 'Factory Events Monitor'`, () => {
    expect(component.appTitle).toEqual('Factory Events Monitor');
  });

  it('should not claim an API connection without checking it', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('API Connected');
  });

  it('should render the brand title in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('Factory Events Monitor');
  });
});
