import { createServiceFactory } from '@ngneat/spectator/jest';
import { SPAN_SCOPE } from '../span';
import { GraphQlFieldFilter } from './field/graphql-field-filter';
import { GlobalGraphQlFilterService } from './global-graphql-filter.service';
import { GraphQlOperatorType } from './graphql-filter';

describe('Global graphql filter serivce', () => {
  const firstFilter = new GraphQlFieldFilter('first', GraphQlOperatorType.Equals, 'first');
  const secondFilter = new GraphQlFieldFilter('second', GraphQlOperatorType.Equals, 'second');
  const thirdFilter = new GraphQlFieldFilter('third', GraphQlOperatorType.Equals, 'third');
  const createService = createServiceFactory({
    service: GlobalGraphQlFilterService
  });
  test('provides no filters by default', () => {
    const spectator = createService();

    expect(spectator.service.getGlobalFilters(SPAN_SCOPE)).toEqual([]);
  });

  test('provides filters from multiple matching rules', () => {
    const spectator = createService();
    spectator.service.setGlobalFilterRule(Symbol('first'), {
      filtersForScope: scope => (scope === SPAN_SCOPE ? [firstFilter] : [])
    });
    spectator.service.setGlobalFilterRule(Symbol('second'), {
      filtersForScope: scope => (scope === 'fake' ? [secondFilter] : [])
    });
    spectator.service.setGlobalFilterRule(Symbol('third'), {
      filtersForScope: scope => (scope === SPAN_SCOPE ? [thirdFilter] : [])
    });
    expect(spectator.service.getGlobalFilters(SPAN_SCOPE)).toEqual([firstFilter, thirdFilter]);
  });

  test('allows removing global filter rules', () => {
    const spectator = createService();
    const filterRuleKey = Symbol('first');
    spectator.service.setGlobalFilterRule(filterRuleKey, {
      filtersForScope: scope => (scope === SPAN_SCOPE ? [firstFilter] : [])
    });

    expect(spectator.service.getGlobalFilters(SPAN_SCOPE)).toEqual([firstFilter]);

    spectator.service.clearGlobalFilterRule(filterRuleKey);
    expect(spectator.service.getGlobalFilters(SPAN_SCOPE)).toEqual([]);
  });

  test('merges with local filters', () => {
    const spectator = createService();
    spectator.service.setGlobalFilterRule(Symbol('first'), {
      filtersForScope: scope => (scope === SPAN_SCOPE ? [firstFilter] : [])
    });

    expect(spectator.service.mergeGlobalFilters(SPAN_SCOPE)).toEqual([firstFilter]);

    expect(spectator.service.mergeGlobalFilters('fake', [secondFilter])).toEqual([secondFilter]);
    expect(spectator.service.mergeGlobalFilters(SPAN_SCOPE, [secondFilter])).toEqual([secondFilter, firstFilter]);
  });
});
