import { ActivatedRoute } from '@angular/router';
import {
  DateFormatMode,
  DisplayDatePipe,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { AttributeMetadataType, MetadataService, traceIdKey, traceTypeKey } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { ObservabilityTraceType } from '../../shared/graphql/model/schema/observability-traces';
import { ApiTraceDetailService } from './api-trace-detail.service';

describe('Api TraceDetailService', () => {
  let spectator: SpectatorService<ApiTraceDetailService>;

  const createService = createServiceFactory({
    service: ApiTraceDetailService,
    providers: [
      mockProvider(ActivatedRoute, {
        paramMap: of({
          get: () => 'test-id'
        })
      }),
      mockProvider(TimeRangeService, {
        getTimeRangeAndChanges: jest.fn().mockReturnValue(of(new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour))))
      }),
      mockProvider(GraphQlRequestService, {
        query: jest.fn().mockReturnValue(
          of({
            [traceTypeKey]: ObservabilityTraceType.Api,
            [traceIdKey]: 'test-id',
            serviceName: 'test service',
            protocol: 'test protocol',
            apiName: 'test api name',
            startTime: 1576364117792,
            duration: 20
          })
        )
      }),
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'Duration',
            units: 'ms',
            type: AttributeMetadataType.Number,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: []
          })
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  test('should map fetch and map trace details', () => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.fetchTraceDetails()).toBe('(x|)', {
        x: {
          id: 'test-id',
          timeString: `${new DisplayDatePipe().transform(1576364117792, {
            mode: DateFormatMode.DateAndTimeWithSeconds
          })} for 20 ms`,
          titleString: 'test service test protocol test api name',
          type: ObservabilityTraceType.Api
        }
      });
    });
  });
});
