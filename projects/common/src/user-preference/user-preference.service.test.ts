import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { UserPreferenceService, USER_PREFERENCES_OPTIONS } from './user-preference.service';

describe('UserPreferenceService testing', () => {
  let spectator: SpectatorService<UserPreferenceService>;
  const createService = createServiceFactory({
    service: UserPreferenceService,
    providers: [
      {
        provide: USER_PREFERENCES_OPTIONS,
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

  const mockPostMethod = (): jest.SpyInstance => {
    const postMock = jest.spyOn(spectator.inject(HttpClient), 'post').mockReturnValue(
      of({
        success: true
      })
    );
    postMock.mockClear();

    return postMock;
  };

  const mockPutMethod = (): jest.SpyInstance => {
    const putMock = jest.spyOn(spectator.inject(HttpClient), 'put').mockReturnValue(
      of({
        success: true
      })
    );
    putMock.mockClear();

    return putMock;
  };

  const mockDeleteMethod = (): jest.SpyInstance => {
    const deleteMock = jest.spyOn(spectator.inject(HttpClient), 'delete').mockReturnValue(
      of({
        success: true
      })
    );
    deleteMock.mockClear();

    return deleteMock;
  };

  beforeEach(() => (spectator = createService()));

  it('can test RestClient.Get', () => {
    const getFnMock = mockGetMethod();
    spectator.service.get('/test').subscribe();
    expect(getFnMock).toHaveBeenCalled();
  });

  it('can test RestClient.post', () => {
    const postFnMock = mockPostMethod();
    spectator.service
      .post('/test', {
        title: 'Title'
      })
      .subscribe();
    expect(postFnMock).toHaveBeenCalled();
  });

  it('can test RestClient.Put', () => {
    const putFnMock = mockPutMethod();
    spectator.service
      .put('/test', {
        title: 'New Title'
      })
      .subscribe();

    expect(putFnMock).toHaveBeenCalled();
  });

  it('can test RestClient.Delete', () => {
    const deleteFnMock = mockDeleteMethod();
    spectator.service.delete('/test').subscribe();

    expect(deleteFnMock).toHaveBeenCalled();
  });
});
