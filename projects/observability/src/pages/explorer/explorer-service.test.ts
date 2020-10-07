import { NavigationParamsType } from '@hypertrace/common';
import { FilterOperator } from '@hypertrace/components';
import { ExplorerService, ScopeQueryParam } from '@hypertrace/observability';
import { createServiceFactory } from '@ngneat/spectator/jest';

describe('Explorer service', () => {
  const createService = createServiceFactory({
    service: ExplorerService
  });

  test('creates nav params correctly', () => {
    const spectator = createService();
    expect(
      spectator.service.buildNavParamsWithFilters(ScopeQueryParam.EndpointTraces, [
        { urlString: 'duration', operator: FilterOperator.GreaterThan, value: 200 },
        { urlString: 'userIdentifier', operator: FilterOperator.Equals, value: 'test' }
      ])
    ).toEqual({
      navType: NavigationParamsType.InApp,
      path: '/explorer',
      queryParams: {
        filter: ['duration_gt_200', 'userIdentifier_eq_test'],
        scope: ScopeQueryParam.EndpointTraces
      }
    });
  });
});
