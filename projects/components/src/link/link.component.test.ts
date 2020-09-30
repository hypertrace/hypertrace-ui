import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { LinkComponent } from './link.component';

describe('Link component', () => {
  let spectator: Spectator<LinkComponent>;

  const createHost = createHostFactory({
    component: LinkComponent,
    shallow: true,
    providers: [mockProvider(NavigationService)]
  });

  test('Link should not be displayed if url is undefined', () => {
    spectator = createHost(`<ht-link [url]="url"></ht-link>`, {
      props: {
        url: undefined
      }
    });

    expect(spectator.query('.ht-link')).not.toExist();
  });

  test('Link should navigate correctly to external URLs', () => {
    spectator = createHost(`<ht-link [url]="url"></ht-link>`, {
      hostProps: {
        url: 'http://test.hypertrace.ai'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue([
            [
              '/external',
              {
                url: 'http://test.hypertrace.ai',
                navType: 'same_window'
              }
            ],
            { skipLocationChange: true }
          ])
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
  });

  test('Link should navigate correctly to internal relative URLs', () => {
    spectator = createHost(`<ht-link [url]="url"></ht-link>`, {
      hostProps: {
        url: 'test'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue([['test'], {}])
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
  });

  test('Link should navigate correctly to internal relative URLs', () => {
    spectator = createHost(`<ht-link [url]="url"></ht-link>`, {
      hostProps: {
        url: '/test'
      },
      providers: [
        mockProvider(NavigationService, {
          buildNavigationParams: jest.fn().mockReturnValue([['/test'], {}])
        })
      ]
    });

    expect(spectator.query('.ht-link')).toExist();
  });
});
