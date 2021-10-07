import { CommonModule } from '@angular/common';
import { fakeAsync } from '@angular/core/testing';
import { createDirectiveFactory, mockProvider, SpectatorDirective } from '@ngneat/spectator/jest';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';
import { TrackDirective } from './track.directive';

describe('Track directive', () => {
  let spectator: SpectatorDirective<TrackDirective>;

  const createDirective = createDirectiveFactory<TrackDirective>({
    directive: TrackDirective,
    imports: [CommonModule],
    providers: [
      mockProvider(UserTelemetryImplService, {
        trackEvent: jest.fn()
      })
    ]
  });

  test('propagates events with default config', fakeAsync(() => {
    spectator = createDirective(
      `
    <div class="content" [htTrack] [htTrackLabel]="label">Test Content</div>
  `,
      {
        hostProps: {
          events: ['click'],
          label: 'Content'
        }
      }
    );

    const telemetryService = spectator.inject(UserTelemetryImplService);

    spectator.click(spectator.element);
    spectator.tick();

    expect(telemetryService.trackEvent).toHaveBeenCalledWith(
      'click: Content',
      expect.objectContaining({ type: 'click' })
    );
  }));

  test('propagates events with custom config', fakeAsync(() => {
    spectator = createDirective(
      `
    <div class="content" [htTrack]="events" [htTrackLabel]="label">Test Content</div>
  `,
      {
        hostProps: {
          events: ['mouseover'],
          label: 'Content'
        }
      }
    );

    const telemetryService = spectator.inject(UserTelemetryImplService);

    spectator.dispatchMouseEvent(spectator.element, 'mouseover');
    spectator.tick();

    expect(telemetryService.trackEvent).toHaveBeenCalledWith(
      'mouseover: Content',
      expect.objectContaining({ type: 'mouseover' })
    );
  }));
});
