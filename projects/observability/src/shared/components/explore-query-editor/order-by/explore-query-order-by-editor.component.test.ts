import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { SelectComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadata } from '../../../graphql/model/metadata/attribute-metadata';
import { MetricAggregationType } from '../../../graphql/model/metrics/metric-aggregation';
import { ObservabilityTraceType } from '../../../graphql/model/schema/observability-traces';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { ExploreQueryOrderByEditorComponent } from './explore-query-order-by-editor.component';

describe('Explore Query Order by Editor component', () => {
  // Define metadata at top level so equality checks always get same values
  const attributeMetadata = jest.fn();

  const hostBuilder = createHostFactory({
    component: ExploreQueryOrderByEditorComponent,
    imports: [HttpClientTestingModule],
    declarations: [MockComponent(SelectComponent)],
    providers: [
      mockProvider(MetadataService, {
        getAttributeDisplayName: (attribute: AttributeMetadata) => attribute.name,
        getSelectionAttributes: jest.fn(() => of(attributeMetadata()))
      }),
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ],
    shallow: true
  });

  beforeEach(() => {
    attributeMetadata.mockReset();
    attributeMetadata.mockReturnValue([
      { name: 'test value', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] },
      { name: 'foo bar', allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Max] }
    ]);
  });

  test('sets sort by to none if undefined provided', fakeAsync(() => {
    attributeMetadata.mockReturnValue([
      {
        name: 'test value',
        allowedAggregations: [MetricAggregationType.Average, MetricAggregationType.Min, MetricAggregationType.Sum]
      },
      {
        name: 'foo bar'
      }
    ]);

    const spectator = hostBuilder(
      `
    <ht-explore-query-order-by-editor
      context="${ObservabilityTraceType.Api}" [orderByExpression]="orderByExpression"
    ></ht-explore-query-order-by-editor>
  `,
      {
        hostProps: {
          orderByExpression: {
            aggregation: MetricAggregationType.Average,
            keyExpression: {
              key: 'duration'
            }
          }
        }
      }
    );
    spectator.tick();

    const selects = spectator.queryAll(SelectComponent);
    expect(selects.length).toBe(3);
    expect(selects[2].selected).toBeUndefined();
  }));
});
