import { UserTelemetryService } from './user-telemetry.service';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

describe('User Telemetry service', () => {
  const createService = createServiceFactory({
    service: UserTelemetryService,
    providers: [
      mockProvider(UserTelemetryInternalService, {
        initialize: jest.fn(),
        shutdown: jest.fn()
      })
    ]
  });
  test('should support a default palette if no palette is requested', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette()).toEqual(new ColorPalette(defaultColors));
  });
});
