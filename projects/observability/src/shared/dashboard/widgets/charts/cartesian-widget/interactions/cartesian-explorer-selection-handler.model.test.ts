import { createModelFactory } from '@hypertrace/dashboards/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { NavigationService } from '@hypertrace/common';
import { ExplorerService } from '../../../../../../pages/explorer/explorer-service';
import { CartesianExplorerSelectionHandlerModel } from './cartesian-explorer-selection-handler.model';

describe('Cartesian Explorer Selection Handler Model', () => {
  const selectedData = [
    {
      dataPoint: {
        timestamp: 'Wed Oct 20 2021 00:25:00 GMT+0530 (India Standard Time)'
      }
    },
    {
      dataPoint: {
        timestamp: 'Wed Oct 20 2021 12:25:00 GMT+0530 (India Standard Time)'
      }
    }
  ];

  const buildModel = createModelFactory({
    providers: [
      mockProvider(ExplorerService, {
        buildNavParamsWithFilters: jest.fn()
      }),
      mockProvider(NavigationService, {
        navigate: jest.fn()
      })
    ]
  });

  test('calls navigateToExplorer with correct parameters', () => {
    const spectator = buildModel(CartesianExplorerSelectionHandlerModel);
    const navService = spectator.get(NavigationService);

    spectator.model.execute(selectedData);

    const navigationUrl = {
      navType: 'in-app',
      path: '/explorer',
      queryParams: {
        filter: ['startTime_gte_1634669700000', 'endTime_lte_1634712900000'],
        scope: 'endpoint-traces'
      }
    };

    expect(navService.navigate).toHaveBeenLastCalledWith(navigationUrl);
  });
});
