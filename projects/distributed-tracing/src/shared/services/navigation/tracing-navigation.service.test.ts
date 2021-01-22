import { NavigationService } from '@hypertrace/common';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { TracingNavigationService } from './tracing-navigation.service';

describe('Tracing Navigation Service', () => {
  let spectator: SpectatorService<TracingNavigationService>;

  const buildService = createServiceFactory({
    service: TracingNavigationService
  });

  test('can navigate correctly to trace detail', () => {
    spectator = buildService({
      providers: [
        mockProvider(NavigationService, {
          navigateWithinApp: jest.fn(),
          isRelativePathActive: () => true
        })
      ]
    });
    const navigationService = spectator.inject(NavigationService);
    spectator.service.navigateToTraceDetail('trace-id', 'span-id', '1608150110610');
    expect(navigationService.navigateWithinApp).toHaveBeenLastCalledWith([
      'trace',
      'trace-id',
      { spanId: 'span-id', startTime: '1608150110610' }
    ]);

    spectator.service.navigateToTraceDetail('trace-id', 'span-id');
    expect(navigationService.navigateWithinApp).toHaveBeenLastCalledWith(['trace', 'trace-id', { spanId: 'span-id' }]);

    spectator.service.navigateToTraceDetail('trace-id');
    expect(navigationService.navigateWithinApp).toHaveBeenLastCalledWith(['trace', 'trace-id', {}]);
  });

  test('can navigate correctly to Api trace detail', () => {
    spectator = buildService({
      providers: [
        mockProvider(NavigationService, {
          navigateWithinApp: jest.fn(),
          isRelativePathActive: () => true
        })
      ]
    });
    const navigationService = spectator.inject(NavigationService);
    spectator.service.navigateToApiTraceDetail('trace-id', '1608150110610');
    expect(navigationService.navigateWithinApp).toHaveBeenLastCalledWith([
      'api-trace',
      'trace-id',
      { startTime: '1608150110610' }
    ]);

    spectator.service.navigateToApiTraceDetail('trace-id');
    expect(navigationService.navigateWithinApp).toHaveBeenLastCalledWith(['api-trace', 'trace-id', {}]);
  });
});
