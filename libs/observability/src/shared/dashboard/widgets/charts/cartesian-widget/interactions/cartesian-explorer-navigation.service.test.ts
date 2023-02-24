import { NavigationService, TimeRangeService } from '@hypertrace/common';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { CartesainExplorerNavigationService } from './cartesian-explorer-navigation.service';

describe('Cartesian Explorer Navigation Service', () => {
  let spectator: SpectatorService<CartesainExplorerNavigationService>;

  const createService = createServiceFactory({
    service: CartesainExplorerNavigationService,
    providers: [
      mockProvider(TimeRangeService, {
        toQueryParams: jest.fn()
      }),
      mockProvider(NavigationService, {
        navigate: jest.fn()
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  test('should navigate to explorer with params', () => {
    spectator.service.navigateToExplorer(new Date(), new Date());

    expect(spectator.inject(TimeRangeService).toQueryParams).toHaveBeenCalled();
    expect(spectator.inject(NavigationService).navigate).toHaveBeenCalled();
  });
});
