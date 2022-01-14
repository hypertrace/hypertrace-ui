import { TimeRangeService } from '@hypertrace/common';
import { PopoverService } from '@hypertrace/components';
import { createModelFactory } from '@hypertrace/dashboards/testing';
import { CartesianSelectedData, CartesianSeriesVisualizationType } from '@hypertrace/observability';
import { mockProvider } from '@ngneat/spectator/jest';
import { CartesainExplorerNavigationService } from './cartesian-explorer-navigation.service';
import { CartesianExplorerSelectionHandlerModel } from './cartesian-explorer-selection-handler.model';

describe('Cartesian Explorer Selection Handler Model', () => {
  const selectedData: CartesianSelectedData<unknown> = {
    timeRange: TimeRangeService.toFixedTimeRange(
      new Date('2021-11-02T05:33:19.288Z'),
      new Date('2021-11-02T14:30:15.141Z')
    ),
    selectedData: [
      {
        dataPoint: { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
        context: {
          data: [
            { timestamp: '2021-11-02T05:15:00.000Z', value: 774 },
            { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
            { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 }
          ],
          units: 'ms',
          color: '#4b5f77',
          name: 'p99',
          type: CartesianSeriesVisualizationType.Column,
          stacking: false,
          hide: false
        },
        location: { x: 59, y: 31.023400000000215 }
      },
      {
        dataPoint: { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 },
        context: {
          data: [
            { timestamp: '2021-11-02T05:15:00.000Z', value: 774 },
            { timestamp: '2021-11-02T05:40:00.000Z', value: 1477.3599999999983 },
            { timestamp: '2021-11-02T12:05:00.000Z', value: 1056.48 }
          ],
          units: 'ms',
          color: '#4b5f77',
          name: 'p99',
          type: CartesianSeriesVisualizationType.Column,
          stacking: false,
          hide: false
        },
        location: { x: 138, y: 82.58120000000001 }
      }
    ],
    location: { x: 452, y: 763 }
  };

  const buildModel = createModelFactory({
    providers: [
      mockProvider(CartesainExplorerNavigationService, {
        navigateToExplorer: jest.fn()
      }),
      mockProvider(PopoverService, {
        drawPopover: jest.fn()
      })
    ]
  });

  test('calls navigate to explorer correct parameters', () => {
    const spectator = buildModel(CartesianExplorerSelectionHandlerModel);
    const cartesainExplorerNavigationService = spectator.get(CartesainExplorerNavigationService);

    spectator.model.showContextMenu = false;

    spectator.model.execute(selectedData);
    expect(cartesainExplorerNavigationService.navigateToExplorer).toHaveBeenCalled();
  });

  test('show context menu', () => {
    const spectator = buildModel(CartesianExplorerSelectionHandlerModel);
    const popoverService = spectator.get(PopoverService);

    spectator.model.showContextMenu = true;

    spectator.model.execute(selectedData);
    expect(popoverService.drawPopover).toHaveBeenCalled();
  });
});
