import { TelemetryGlobalErrorHandler } from './telemetry-global-error-handler';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';

describe('Telemetry Global Error Handler ', () => {
  const createService = createServiceFactory({
    service: TelemetryGlobalErrorHandler,
    providers: [
      mockProvider(UserTelemetryImplService, {
        trackErrorEvent: jest.fn()
      })
    ]
  });

  test('should delegate to telemetry provider after registration', () => {
    const spectator = createService();
    try {
      spectator.service.handleError(new Error('Test error'));
    } catch (_) {}

    expect(spectator.inject(UserTelemetryImplService).trackErrorEvent).toHaveBeenCalledWith(
      'Test error',
      expect.objectContaining({
        message: 'Test error',
        name: 'Error',
        isError: true
      })
    );
  });
});
