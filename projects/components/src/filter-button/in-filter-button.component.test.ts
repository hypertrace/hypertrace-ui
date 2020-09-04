import { FilterAttribute, FilterType, InFilterButtonComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { FilterButtonService } from './filter-button.service';

describe('In Filter Button service', () => {
  const attributes: FilterAttribute[] = [
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: FilterType.Number
    },
    {
      name: 'apiName',
      displayName: 'API Name',
      units: '',
      type: FilterType.String
    }
  ];

  const createHost = createHostFactory({
    component: InFilterButtonComponent,
    shallow: true,
    imports: [],
    providers: [
      mockProvider(FilterButtonService, {
        isSupportedOperator: () => true,
        getUrlFilters: () => [{ field: attributes[0].name, operator: 'IN', value: [5, 8] }],
        buildFilter: (_attribute: FilterAttribute, value: unknown) => ({ value: value })
      })
    ],
    declarations: [],
    template: `
      <htc-in-filter-button
        [metadata]="attributes"
        [attribute]="attribute"
        [values]="values"
      ></htc-in-filter-button>
    `
  });

  test('should apply selected attributes on popover close', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        attributes: attributes,
        attribute: attributes[0],
        values: [1, 2, 3, 5, 8, 13, 21, 34]
      }
    });

    spectator.component.selected.add(2);
    spectator.component.onPopoverClose();

    expect(spectator.inject(FilterButtonService).applyUrlFilter).toHaveBeenCalledWith(
      attributes,
      expect.objectContaining({
        value: [2]
      })
    );
  });

  test('should toggle attributes', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        attributes: attributes,
        attribute: attributes[0],
        values: [1, 2, 3, 5, 8, 13, 21, 34]
      }
    });

    spectator.component.onPopoverOpen();

    expect(spectator.component.selected.has(5)).toBe(true);
    expect(spectator.component.selected.has(8)).toBe(true);

    spectator.component.onChecked(true, 2);
    spectator.component.onChecked(false, 5);
    spectator.component.onPopoverClose();

    expect(spectator.inject(FilterButtonService).applyUrlFilter).toHaveBeenCalledWith(
      attributes,
      expect.objectContaining({
        value: [2, 8]
      })
    );
  });

  test('should clear unselected attributes on popover close', () => {
    const spectator = createHost(undefined, {
      hostProps: {
        attributes: attributes,
        attribute: attributes[0],
        values: [1, 2, 3, 5, 8, 13, 21, 34]
      }
    });

    spectator.component.onPopoverOpen();

    expect(spectator.component.selected.has(5)).toBe(true);
    expect(spectator.component.selected.has(8)).toBe(true);

    spectator.component.selected.delete(5);
    spectator.component.selected.delete(8);
    spectator.component.onPopoverClose();

    expect(spectator.inject(FilterButtonService).removeUrlFilter).toHaveBeenCalled();
  });
});
