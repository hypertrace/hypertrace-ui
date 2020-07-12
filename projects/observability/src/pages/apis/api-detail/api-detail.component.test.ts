import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { ApiDetailComponent } from './api-detail.component';
import { ApiDetailService, ApiType } from './api-detail.service';

describe('Api detail component', () => {
  const componentFactory = createComponentFactory({
    component: ApiDetailComponent,
    shallow: true,
    providers: [
      mockProvider(GraphQlRequestService),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Enabled)
      })
    ]
  });

  test('shows api overview tab for http requests', () => {
    const spectator = componentFactory({
      providers: [
        mockProvider(ApiDetailService, {
          getEntity: () =>
            of({
              [entityTypeKey]: ObservabilityEntityType.Api,
              [entityIdKey]: 'test-id',
              apiType: ApiType.Http
            })
        })
      ]
    });

    expect(spectator.element).toHaveText('Overview');
    expect(spectator.element).toHaveText('Traces');
  });
});
