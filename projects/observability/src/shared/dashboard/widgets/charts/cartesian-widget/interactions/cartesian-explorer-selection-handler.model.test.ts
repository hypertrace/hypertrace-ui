import { NavigationService } from '@hypertrace/common';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { ExplorerService } from '../../../../../../pages/explorer/explorer-service';
import { CartesianExplorerSelectionHandlerModel } from './cartesian-explorer-selection-handler.model';

describe('Cartesian Explorer Selection Handler Model', () => {
  const buildModel = createModelFactory({
    providers: [mockProvider(ExplorerService), mockProvider(NavigationService)]
  });

  test('calls navigateToExplorer with correct parameters', () => {
    const spectator = buildModel(CartesianExplorerSelectionHandlerModel);
    const explorerService = spectator.get(ExplorerService);
    const navService = spectator.get(NavigationService);

    const navigationUrl1 = {
      navType: 'in-app',
      path: '/explorer',
      queryParams: {
        filter: ['startTime_gte_1634669700000', 'endTime_lte_1634712900000'],
        scope: 'endpoint-traces'
      }
    };

    spyOn(explorerService, 'buildNavParamsWithFilters').and.returnValue(navigationUrl1);
    setTimeout(() => {
      expect(navService.navigate).toHaveBeenCalledWith(navigationUrl1);
    });
  });
});
