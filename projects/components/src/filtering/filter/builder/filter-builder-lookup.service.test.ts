import { FilterAttribute, FilterType } from '@hypertrace/components';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderLookupService } from './filter-builder.service';
import { NumberFilterBuilder } from '../../filter-bar/filter/builder/number-filter-builder';
import { StringFilterBuilder } from '../../filter-bar/filter/builder/string-filter-builder';

describe('Filter Builder service', () => {
  let spectator: SpectatorService<FilterBuilderLookupService>;

  const attributes: FilterAttribute[] = [
    {
      name: 'calls',
      displayName: 'Calls',
      units: '',
      type: FilterType.Number
    },
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: FilterType.Number
    },
    {
      name: 'name',
      displayName: 'Name',
      units: '',
      type: FilterType.String
    },
    {
      name: 'endTime',
      displayName: 'End Time',
      units: '',
      type: FilterType.Timestamp
    },
    {
      name: 'tags',
      displayName: 'Tags',
      units: '',
      type: FilterType.StringMap
    }
  ];

  const buildService = createServiceFactory({
    service: FilterBuilderLookupService
  });

  beforeEach(() => {
    spectator = buildService();

    spectator.service.registerAll([NumberFilterBuilder, StringFilterBuilder]);
  });

  test('correctly looks up registered filter builders', () => {
    expect(spectator.service.lookup(attributes[0])).toEqual(expect.any(NumberFilterBuilder));
    expect(spectator.service.lookup(attributes[2])).toEqual(expect.any(StringFilterBuilder));
  });

  test('correctly identify supported types', () => {
    expect(spectator.service.isSupportedType(attributes[0])).toEqual(true);
    expect(spectator.service.isSupportedType(attributes[2])).toEqual(true);
    expect(spectator.service.isSupportedType(attributes[3])).toEqual(false);
    expect(spectator.service.isSupportedType(attributes[4])).toEqual(false);
  });
});
