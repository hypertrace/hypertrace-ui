import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { InstrumentationQualityService, INSTRUMENTATION_QUALITY_OPTIONS } from './instrumentation-quality.service';

describe('InstrumentationQuality', () => {
  let spectator: SpectatorService<InstrumentationQualityService>;
  const createService = createServiceFactory({
    service: InstrumentationQualityService,
    providers: [
      {
        provide: INSTRUMENTATION_QUALITY_OPTIONS,
        useValue: {
          uri: '/'
        }
      },
      {
        provide: HttpClient,
        useValue: {
          get: jest.fn().mockReturnValueOnce(of({ success: true })),
          post: jest.fn().mockReturnValueOnce(of({ success: true })),
          put: jest.fn().mockReturnValueOnce(of({ success: true })),
          delete: jest.fn().mockReturnValueOnce(of({ success: true }))
        }
      },
      {
        provide: Injector,
        useValue: {
          get: () => []
        }
      }
    ]
  });

  const mockGetMethod = (): jest.SpyInstance => {
    const getMock = jest.spyOn(spectator.inject(HttpClient), 'get').mockReturnValue(
      of({
        success: true
      })
    );
    getMock.mockClear();

    return getMock;
  };

  beforeEach(() => (spectator = createService()));

  test('GET service score', () => {
    const getFnMock = mockGetMethod();
    spectator.service.getServiceScore('/test').subscribe();
    expect(getFnMock).toHaveBeenCalled();
  });

  test('GET org score', () => {
    const getFnMock = mockGetMethod();
    spectator.service.getOrgScore().subscribe();
    expect(getFnMock).toHaveBeenCalled();
  });
});
