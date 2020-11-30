import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { ModalRef, MODAL_DATA } from '../../modal/modal';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { NumberFilterBuilder } from '../filter/builder/types/number-filter-builder';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterAttributeType } from '../filter/filter-attribute-type';
import { FilterUrlService } from '../filter/filter-url.service';
import { InFilterModalComponent } from './in-filter-modal.component';

describe('In Filter Modal component', () => {
  const attributes: FilterAttribute[] = [
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: FilterAttributeType.Number
    },
    {
      name: 'apiName',
      displayName: 'API Name',
      units: '',
      type: FilterAttributeType.String
    }
  ];

  const createHost = createHostFactory({
    component: InFilterModalComponent,
    shallow: true,
    imports: [],
    providers: [
      {
        provide: ModalRef,
        useFactory: () => ({
          close: jest.fn()
        })
      },
      {
        provide: MODAL_DATA,
        useValue: {
          metadata: attributes,
          attribute: attributes[0],
          values: [2, 5, 8]
        }
      },
      mockProvider(FilterUrlService, {
        getUrlFilters: () => [{ field: attributes[0].name, operator: 'IN', value: [5, 8] }]
      }),
      mockProvider(FilterBuilderLookupService, {
        lookup: () => new NumberFilterBuilder()
      })
    ],
    declarations: [],
    template: `
      <ht-in-filter-modal></ht-in-filter-modal>
    `
  });

  test('should apply selected attributes on popover close', () => {
    const spectator = createHost();

    spectator.component.selected.add(2);
    spectator.component.onApply();

    expect(spectator.inject(FilterUrlService).addUrlFilter).toHaveBeenCalledWith(
      attributes,
      expect.objectContaining({
        value: [2, 5, 8]
      })
    );
  });

  test('should toggle attributes', () => {
    const spectator = createHost();

    expect(spectator.component.selected.has(5)).toBe(true);
    expect(spectator.component.selected.has(8)).toBe(true);

    spectator.component.onChecked(true, 2);
    spectator.component.onChecked(false, 5);
    spectator.component.onApply();

    expect(spectator.inject(FilterUrlService).addUrlFilter).toHaveBeenCalledWith(
      attributes,
      expect.objectContaining({
        value: [2, 8]
      })
    );
  });

  test('should clear unselected attributes on popover close', () => {
    const spectator = createHost();

    expect(spectator.component.selected.has(5)).toBe(true);
    expect(spectator.component.selected.has(8)).toBe(true);

    spectator.component.selected.delete(5);
    spectator.component.selected.delete(8);
    spectator.component.onApply();

    expect(spectator.inject(FilterUrlService).removeUrlFilter).toHaveBeenCalled();
  });
});
