import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { PageHeaderComponent } from '@hypertrace/components';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { entityIdKey, entityTypeKey, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { ApiDetailComponent } from './api-detail.component';
import { ApiDetailService, ApiType } from './api-detail.service';

describe('Api detail component', () => {
  const componentFactory = createComponentFactory({
    component: ApiDetailComponent,
    shallow: true,
    declarations: [MockComponent(PageHeaderComponent)],
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

    expect(spectator.query(PageHeaderComponent)?.tabs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Overview' }),
        expect.objectContaining({ label: 'Traces' })
      ])
    );
  });
});
