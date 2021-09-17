import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { UserTelemetryHelperService } from './user-telemetry-helper.service';
import { UserTelemetryService } from './user-telemetry.service';

describe('User Telemetry service', () => {
  const createService = createServiceFactory({
    service: UserTelemetryService,
    providers: [
      mockProvider(UserTelemetryHelperService, {
        initialize: jest.fn(),
        identify: jest.fn(),
        shutdown: jest.fn()
      })
    ]
  });

  test('should delegate to helper service', () => {
    const spectator = createService();
    const helperService = spectator.inject(UserTelemetryHelperService);

    spectator.service.initialize({ email: 'test@email.com' });
    expect(helperService.initialize).toHaveBeenCalledWith();
    expect(helperService.identify).toHaveBeenCalledWith({ email: 'test@email.com' });

    spectator.service.shutdown();
    expect(helperService.shutdown).toHaveBeenCalledWith();
  });
});
