import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { UserTelemetryImplService } from '../user-telemetry-impl.service';
import { TelemetryGlobalErrorHandler } from './telemetry-global-error-handler';

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
    } catch (_) {
      // NoOP
    }

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
