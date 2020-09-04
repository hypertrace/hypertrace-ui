import { isEqualIgnoreFunctions } from '@hypertrace/common';
import { createModelFactory, SpectatorModel } from '@hypertrace/dashboards/testing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { ModelApi } from '@hypertrace/hyperdash';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { spanIdKey } from '../../../../graphql/model/schema/span';
import { GraphQlTimeRange } from '../../../../graphql/model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SPAN_GQL_REQUEST } from '../../../../graphql/request/handlers/spans/span-graphql-query-handler.service';
import { SpanDetailDataSourceModel } from './span-detail-data-source.model';

describe('Span Detail data source model', () => {
  let spectator!: SpectatorModel<SpanDetailDataSourceModel>;
  const attributeSpecBuilder = new SpecificationBuilder();
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let lastEmittedQuery: unknown;

  const buildModel = createModelFactory({
    providers: [
      mockProvider(GraphQlRequestService, {
        queryImmediately: jest.fn().mockReturnValue(
          of({
            [spanIdKey]: 'test-id',
            statusCode: '200',
            spanTags: { param1: 'email' }
          })
        )
      })
    ]
  });

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    spectator = buildModel(SpanDetailDataSourceModel);

    spectator.model.span = {
      [spanIdKey]: 'test-id'
    };
    spectator.model.api = mockApi as ModelApi;
    spectator.model.query$.subscribe(query => (lastEmittedQuery = query.buildRequest([])));
  });

  test('builds expected request', () => {
    spectator.model.getData();
    expect(
      isEqualIgnoreFunctions(lastEmittedQuery, {
        requestType: SPAN_GQL_REQUEST,
        id: 'test-id',
        timeRange: new GraphQlTimeRange(testTimeRange.startTime, testTimeRange.endTime),
        properties: [
          attributeSpecBuilder.attributeSpecificationForKey('statusCode'),
          attributeSpecBuilder.attributeSpecificationForKey('spanTags')
        ]
      })
    ).toBe(true);
  });

  test('transforms raw data to SpanDetailData', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.model.getData()).toBe('(x|)', {
        x: expect.objectContaining({
          [spanIdKey]: 'test-id',
          statusCode: '200',
          tags: { param1: 'email' }
        })
      });
    });
  });
});
