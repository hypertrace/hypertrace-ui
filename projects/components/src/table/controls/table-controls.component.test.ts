import { fakeAsync } from '@angular/core/testing';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { MultiSelectComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SearchBoxComponent } from '../../search-box/search-box.component';
import { ToggleGroupComponent } from '../../toggle-group/toggle-group.component';
import { TableControlsComponent } from './table-controls.component';

describe('Table Controls component', () => {
  const createHost = createHostFactory({
    component: TableControlsComponent,
    shallow: true,
    providers: [mockProvider(SubscriptionLifecycle)],
    declarations: [
      MockComponent(SearchBoxComponent),
      MockComponent(MultiSelectComponent),
      MockComponent(ToggleGroupComponent)
    ],
    template: `
      <ht-table-controls
        [searchEnabled]="searchEnabled"
        [searchPlaceholder]="searchPlaceholder"
        [selectControls]="selectControls"
        [viewItems]="viewItems"
        (searchChange)="searchChange($event)"
        (selectChange)="selectChange($event)"
        (viewChange)="viewChange($event)"
      >
      </ht-table-controls>
    `
  });

  test('should pass custom placeholder to search box', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        searchEnabled: true,
        searchPlaceholder: 'Custom'
      }
    });

    expect(spectator.query(SearchBoxComponent)?.placeholder).toEqual('Custom');
  });

  test('should emit search string when entered', fakeAsync(() => {
    const onChangeSpy = jest.fn();

    const spectator = createHost(undefined, {
      hostProps: {
        searchEnabled: true,
        searchChange: onChangeSpy
      }
    });

    spectator.triggerEventHandler(SearchBoxComponent, 'valueChange', 'testing');
    spectator.tick(200);

    expect(onChangeSpy).toHaveBeenCalledWith('testing');
  }));

  test('should provide select options for each select control', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        selectControls: [
          {
            placeholder: 'test1',
            options: [
              {
                label: 'first1',
                metaValue: 'first-1'
              },
              {
                label: 'second1',
                metaValue: 'second-1'
              }
            ]
          }
        ]
      }
    });

    expect(spectator.query(MultiSelectComponent)?.placeholder).toEqual('test1');
  });

  test('should emit selection when selected', () => {
    const onChangeSpy = jest.fn();

    const spectator = createHost(undefined, {
      hostProps: {
        selectControls: [
          {
            placeholder: 'test1',
            options: [
              {
                label: 'first1',
                value: 'first-1'
              },
              {
                label: 'second1',
                value: 'second-1'
              }
            ]
          }
        ],
        selectChange: onChangeSpy
      }
    });

    spectator.triggerEventHandler(MultiSelectComponent, 'selectedChange', [
      {
        label: 'first1',
        value: 'first-1'
      }
    ]);

    expect(onChangeSpy).toHaveBeenCalled();
  });

  test('should provide toggle group items for each view', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        viewItems: [
          {
            label: 'test1',
            value: 'TEST1'
          },
          {
            label: 'test2',
            value: 'TEST2'
          }
        ]
      }
    });

    expect(spectator.query(ToggleGroupComponent)?.items?.length).toEqual(2);
  });

  test('should emit view when selected', () => {
    const onChangeSpy = jest.fn();

    const spectator = createHost(undefined, {
      hostProps: {
        viewItems: [
          {
            label: 'test1',
            value: 'TEST1'
          },
          {
            label: 'test2',
            value: 'TEST2'
          }
        ],
        viewChange: onChangeSpy
      }
    });

    spectator.triggerEventHandler(ToggleGroupComponent, 'activeItemChange', {
      label: 'test1',
      value: 'Test1'
    });

    expect(onChangeSpy).toHaveBeenCalled();
  });
});
