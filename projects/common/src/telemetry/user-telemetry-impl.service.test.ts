import { InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { TelemetryProviderConfig, UserTelemetryProvider, UserTelemetryRegistrationConfig } from './telemetry';
import { UserTelemetryImplService } from './user-telemetry-impl.service';

describe('User Telemetry helper service', () => {
  const injectionToken = new InjectionToken('test-token');
  let telemetryProvider: UserTelemetryProvider;
  let registrationConfig: UserTelemetryRegistrationConfig<TelemetryProviderConfig>;

  const createService = createServiceFactory({
    service: UserTelemetryImplService,
    providers: [
      mockProvider(Router, {
        events: of({})
      })
    ]
  });

  test('should delegate to telemetry provider after registration', () => {
    registrationConfig = {
      telemetryProvider: injectionToken,
      initConfig: { orgId: 'test-id' },
      enablePageTracking: true,
      enableEventTracking: true,
      enableErrorTracking: true
    };

    telemetryProvider = {
      initialize: jest.fn(),
      identify: jest.fn(),
      trackEvent: jest.fn(),
      trackPage: jest.fn(),
      trackError: jest.fn(),
      shutdown: jest.fn()
    };

    const spectator = createService({
      providers: [
        {
          provide: injectionToken,
          useValue: telemetryProvider
        }
      ]
    });

    spectator.service.register(registrationConfig);

    // Initialize
    spectator.service.initialize();
    expect(telemetryProvider.initialize).toHaveBeenCalledWith({ orgId: 'test-id' });

    // Identify
    spectator.service.identify({ email: 'test@email.com' });
    expect(telemetryProvider.identify).toHaveBeenCalledWith({ email: 'test@email.com' });

    // TrackEvent
    spectator.service.trackEvent('eventA', { target: 'unknown' });
    expect(telemetryProvider.trackEvent).toHaveBeenCalledWith('eventA', {
      target: 'unknown',
      eventCategory: 'user-action'
    });

    // TrackPage
    spectator.service.trackPageEvent('/abs', { target: 'unknown' });
    expect(telemetryProvider.trackPage).toHaveBeenCalledWith('/abs', { target: 'unknown', eventCategory: 'page-view' });

    // TrackError
    spectator.service.trackErrorEvent('console error', { target: 'unknown' });
    expect(telemetryProvider.trackError).toHaveBeenCalledWith('Error: console error', {
      target: 'unknown',
      eventCategory: 'error'
    });
  });

  test('should not capture events if event tracking is disabled', () => {
    registrationConfig = {
      telemetryProvider: injectionToken,
      initConfig: { orgId: 'test-id' },
      enablePageTracking: true,
      enableEventTracking: false,
      enableErrorTracking: true
    };

    telemetryProvider = {
      initialize: jest.fn(),
      identify: jest.fn(),
      trackEvent: jest.fn(),
      trackPage: jest.fn(),
      trackError: jest.fn(),
      shutdown: jest.fn()
    };

    const spectator = createService({
      providers: [
        {
          provide: injectionToken,
          useValue: telemetryProvider
        }
      ]
    });

    spectator.service.register(registrationConfig);

    // Initialize
    spectator.service.initialize();
    expect(telemetryProvider.initialize).toHaveBeenCalledWith({ orgId: 'test-id' });

    // Identify
    spectator.service.identify({ email: 'test@email.com' });
    expect(telemetryProvider.identify).toHaveBeenCalledWith({ email: 'test@email.com' });

    // TrackEvent
    spectator.service.trackEvent('eventA', { target: 'unknown' });
    expect(telemetryProvider.trackEvent).not.toHaveBeenCalled();

    // TrackPage
    spectator.service.trackPageEvent('/abs', { target: 'unknown' });
    expect(telemetryProvider.trackPage).toHaveBeenCalledWith('/abs', { target: 'unknown', eventCategory: 'page-view' });

    // TrackError
    spectator.service.trackErrorEvent('console error', { target: 'unknown' });
    expect(telemetryProvider.trackError).toHaveBeenCalledWith('Error: console error', {
      target: 'unknown',
      eventCategory: 'error'
    });
  });

  test('should not capture page events if page event tracking is disabled', () => {
    registrationConfig = {
      telemetryProvider: injectionToken,
      initConfig: { orgId: 'test-id' },
      enablePageTracking: false,
      enableEventTracking: true,
      enableErrorTracking: true
    };

    telemetryProvider = {
      initialize: jest.fn(),
      identify: jest.fn(),
      trackEvent: jest.fn(),
      trackPage: jest.fn(),
      trackError: jest.fn(),
      shutdown: jest.fn()
    };

    const spectator = createService({
      providers: [
        {
          provide: injectionToken,
          useValue: telemetryProvider
        }
      ]
    });

    spectator.service.register(registrationConfig);

    // Initialize
    spectator.service.initialize();
    expect(telemetryProvider.initialize).toHaveBeenCalledWith({ orgId: 'test-id' });

    // Identify
    spectator.service.identify({ email: 'test@email.com' });
    expect(telemetryProvider.identify).toHaveBeenCalledWith({ email: 'test@email.com' });

    // TrackEvent
    spectator.service.trackEvent('eventA', { target: 'unknown' });
    expect(telemetryProvider.trackEvent).toHaveBeenCalledWith('eventA', {
      target: 'unknown',
      eventCategory: 'user-action'
    });

    // TrackPage
    spectator.service.trackPageEvent('/abs', { target: 'unknown' });
    expect(telemetryProvider.trackPage).not.toHaveBeenCalled();

    // TrackError
    spectator.service.trackErrorEvent('console error', { target: 'unknown' });
    expect(telemetryProvider.trackError).toHaveBeenCalledWith('Error: console error', {
      target: 'unknown',
      eventCategory: 'error'
    });
  });

  test('should not capture error events if eror event tracking is disabled', () => {
    registrationConfig = {
      telemetryProvider: injectionToken,
      initConfig: { orgId: 'test-id' },
      enablePageTracking: true,
      enableEventTracking: true,
      enableErrorTracking: false
    };

    telemetryProvider = {
      initialize: jest.fn(),
      identify: jest.fn(),
      trackEvent: jest.fn(),
      trackPage: jest.fn(),
      trackError: jest.fn(),
      shutdown: jest.fn()
    };

    const spectator = createService({
      providers: [
        {
          provide: injectionToken,
          useValue: telemetryProvider
        }
      ]
    });

    spectator.service.register(registrationConfig);

    // Initialize
    spectator.service.initialize();
    expect(telemetryProvider.initialize).toHaveBeenCalledWith({ orgId: 'test-id' });

    // Identify
    spectator.service.identify({ email: 'test@email.com' });
    expect(telemetryProvider.identify).toHaveBeenCalledWith({ email: 'test@email.com' });

    // TrackEvent
    spectator.service.trackEvent('eventA', { target: 'unknown' });
    expect(telemetryProvider.trackEvent).toHaveBeenCalledWith('eventA', {
      target: 'unknown',
      eventCategory: 'user-action'
    });

    // TrackPage
    spectator.service.trackPageEvent('/abs', { target: 'unknown' });
    expect(telemetryProvider.trackPage).toHaveBeenCalledWith('/abs', { target: 'unknown', eventCategory: 'page-view' });

    // TrackError
    spectator.service.trackPageEvent('console error', { target: 'unknown' });
    expect(telemetryProvider.trackError).not.toHaveBeenCalled();
  });
});
