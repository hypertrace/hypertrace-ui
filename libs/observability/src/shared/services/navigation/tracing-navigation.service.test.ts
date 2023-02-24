import { NavigationParamsType, NavigationService } from '@hypertrace/common';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { TracingNavigationService } from './tracing-navigation.service';

describe('Tracing Navigation Service', () => {
  let spectator: SpectatorService<TracingNavigationService>;

  const buildService = createServiceFactory({
    service: TracingNavigationService,
    providers: [
      mockProvider(NavigationService, {
        navigate: jest.fn(),
        isRelativePathActive: () => true
      })
    ]
  });

  test('can navigate correctly to trace detail', () => {
    spectator = buildService();
    const navigationService = spectator.inject(NavigationService);
    spectator.service.navigateToTraceDetail('trace-id', 'span-id', '1608150110610');
    expect(navigationService.navigate).toHaveBeenLastCalledWith({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', { spanId: 'span-id', startTime: '1608150110610' }]
    });

    spectator.service.navigateToTraceDetail('trace-id', 'span-id');
    expect(navigationService.navigate).toHaveBeenLastCalledWith({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', { spanId: 'span-id' }]
    });

    spectator.service.navigateToTraceDetail('trace-id');
    expect(navigationService.navigate).toHaveBeenLastCalledWith({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', {}]
    });
  });

  test('builds correct trace detail navigation params', () => {
    spectator = buildService();
    expect(spectator.service.buildTraceDetailNavigationParam('trace-id', 'span-id', '1608150110610')).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', { spanId: 'span-id', startTime: '1608150110610' }]
    });

    expect(spectator.service.buildTraceDetailNavigationParam('trace-id', 'span-id')).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', { spanId: 'span-id' }]
    });

    expect(spectator.service.buildTraceDetailNavigationParam('trace-id')).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/trace', 'trace-id', {}]
    });
  });

  test('builds correct Api trace detail navigation params', () => {
    spectator = buildService();

    expect(spectator.service.buildApiTraceDetailNavigationParam('trace-id', '1608150110610')).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/api-trace', 'trace-id', { startTime: '1608150110610' }]
    });

    expect(spectator.service.buildApiTraceDetailNavigationParam('trace-id')).toEqual({
      navType: NavigationParamsType.InApp,
      path: ['/api-trace', 'trace-id', {}]
    });
  });

  test('can navigate correctly to Api trace detail', () => {
    spectator = buildService();
    const navigationService = spectator.inject(NavigationService);
    spectator.service.navigateToApiTraceDetail('trace-id', '1608150110610');
    expect(navigationService.navigate).toHaveBeenLastCalledWith({
      navType: NavigationParamsType.InApp,
      path: ['/api-trace', 'trace-id', { startTime: '1608150110610' }]
    });

    spectator.service.navigateToApiTraceDetail('trace-id');
    expect(navigationService.navigate).toHaveBeenLastCalledWith({
      navType: NavigationParamsType.InApp,
      path: ['/api-trace', 'trace-id', {}]
    });
  });
});
