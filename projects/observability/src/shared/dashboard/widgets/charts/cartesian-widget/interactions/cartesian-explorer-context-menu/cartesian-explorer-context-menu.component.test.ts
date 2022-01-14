import { ChangeDetectionStrategy, Component, Inject, Injector, Optional } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TimeRangeService } from '@hypertrace/common';
import { ButtonComponent, DividerComponent, POPOVER_DATA } from '@hypertrace/components';
import { CartesianSelectedData, CartesianSeriesVisualizationType } from '@hypertrace/observability';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { CartesainExplorerNavigationService } from '../cartesian-explorer-navigation.service';
import { CartesianExplorerContextMenuComponent, ContextMenu } from './cartesian-explorer-context-menu.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'test-context-menu-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="test-modal-content">Test Component Content</div> `
})
class TestComponent {
  public constructor(
    public readonly injector: Injector,
    @Optional() @Inject(POPOVER_DATA) public readonly data: unknown
  ) {}
}

describe('Sheet Overlay component', () => {
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

  const createHost = createHostFactory({
    component: CartesianExplorerContextMenuComponent,
    declarations: [MockComponent(ButtonComponent), MockComponent(DividerComponent), TestComponent],
    shallow: true,
    template: `
  <ht-cartesian-explorer-context-menu>
  </ht-cartesian-explorer-context-menu>
    `,
    providers: [
      mockProvider(CartesainExplorerNavigationService, {
        navigateToExplorer: jest.fn()
      }),
      mockProvider(TimeRangeService, {
        toQueryParams: jest.fn()
      })
    ]
  });

  const createConfiguredHost = ({}) =>
    createHost(undefined, {
      providers: [
        {
          provide: POPOVER_DATA,
          deps: [Injector],
          useFactory: (injector: Injector) => ({
            injector: Injector.create({
              providers: [
                {
                  provide: POPOVER_DATA,
                  useValue: {}
                }
              ],
              // Normally, this would be a root injector when this is invoked from a service
              parent: injector
            })
          })
        }
      ]
    });

  test('should navigate to explorer on click explore menu', () => {
    spectator = createConfiguredHost({
      data: selectedData
    });

    spectator.component.selectionData = selectedData;

    const menu: ContextMenu = {
      name: 'Explore',
      icon: IconType.ArrowUpRight,
      onClick: () => {
        spectator
          .inject(CartesainExplorerNavigationService)
          .navigateToExplorer(selectedData.timeRange.startTime, selectedData.timeRange.endTime);
      }
    };

    menu.onClick();

    expect(spectator.inject(CartesainExplorerNavigationService).navigateToExplorer).toHaveBeenCalled();
  });
});
