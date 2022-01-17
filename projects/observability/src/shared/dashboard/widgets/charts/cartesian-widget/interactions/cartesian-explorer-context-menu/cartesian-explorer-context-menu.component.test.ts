import { StaticProvider } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TimeRangeService } from '@hypertrace/common';
import { ButtonComponent, DividerComponent, POPOVER_DATA } from '@hypertrace/components';
import { CartesianSelectedData, CartesianSeriesVisualizationType } from '@hypertrace/observability';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { CartesainExplorerNavigationService } from '../cartesian-explorer-navigation.service';
import { CartesianExplorerContextMenuComponent } from './cartesian-explorer-context-menu.component';

describe('Cartesian context menu component', () => {
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
  let spectator: Spectator<CartesianExplorerContextMenuComponent<unknown>>;

  const createComponent = createComponentFactory({
    component: CartesianExplorerContextMenuComponent,
    declarations: [MockComponent(ButtonComponent), MockComponent(DividerComponent)],
    shallow: true,
    providers: [
      mockProvider(CartesainExplorerNavigationService, {
        navigateToExplorer: jest.fn()
      }),
      mockProvider(TimeRangeService, {
        toQueryParams: jest.fn(),
        setFixedRange: jest.fn()
      })
    ]
  });

  const buildProviders = (data: CartesianSelectedData<unknown>): { providers: StaticProvider[] } => ({
    providers: [
      {
        provide: POPOVER_DATA,
        useValue: data
      }
    ]
  });

  test('should navigate to explorer on click explore menu', () => {
    spectator = createComponent(buildProviders(selectedData));

    spectator.component.selectionData = selectedData;
    spectator.component.menus = [
      {
        name: 'Set Time Range',
        icon: IconType.Alarm,
        onClick: () => {
          spectator
            .inject(TimeRangeService)
            .setFixedRange(selectedData.timeRange.startTime, selectedData.timeRange.endTime);
        }
      },
      {
        name: 'Explore',
        icon: IconType.ArrowUpRight,
        onClick: () => {
          spectator
            .inject(CartesainExplorerNavigationService)
            .navigateToExplorer(selectedData.timeRange.startTime, selectedData.timeRange.endTime);
        }
      }
    ];

    const buttons = spectator.queryAll(ButtonComponent);
    expect(buttons.length).toBe(2);

    const exploreMenu = spectator.queryAll('ht-button')[1];

    spectator.click(exploreMenu);

    expect(spectator.inject(CartesainExplorerNavigationService).navigateToExplorer).toHaveBeenCalled();
  });

  test('should change timerange on click timerange menu', () => {
    spectator = createComponent(buildProviders(selectedData));

    spectator.component.selectionData = selectedData;
    spectator.component.menus = [
      {
        name: 'Set Time Range',
        icon: IconType.Alarm,
        onClick: () => {
          spectator
            .inject(TimeRangeService)
            .setFixedRange(selectedData.timeRange.startTime, selectedData.timeRange.endTime);
        }
      },
      {
        name: 'Explore',
        icon: IconType.ArrowUpRight,
        onClick: () => {
          spectator
            .inject(CartesainExplorerNavigationService)
            .navigateToExplorer(selectedData.timeRange.startTime, selectedData.timeRange.endTime);
        }
      }
    ];

    const buttons = spectator.queryAll(ButtonComponent);
    expect(buttons.length).toBe(2);

    const timerangeMenu = spectator.queryAll('ht-button')[0];

    spectator.click(timerangeMenu);

    expect(spectator.inject(TimeRangeService).setFixedRange).toHaveBeenCalled();
  });
});
