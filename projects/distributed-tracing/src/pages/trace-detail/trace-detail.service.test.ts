import { ActivatedRoute } from '@angular/router';
import {
  DateFormatMode,
  DisplayDatePipe,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { AttributeMetadataType } from '../../shared/graphql/model/metadata/attribute-metadata';
import { spanIdKey } from '../../shared/graphql/model/schema/span';
import { traceIdKey, traceTypeKey, TRACE_SCOPE } from '../../shared/graphql/model/schema/trace';
import { MetadataService } from '../../shared/services/metadata/metadata.service';
import { TraceDetailService } from './trace-detail.service';

describe('TraceDetailService', () => {
  let spectator: SpectatorService<TraceDetailService>;

  const createService = createServiceFactory({
    service: TraceDetailService,
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
            [traceTypeKey]: TRACE_SCOPE,
            [traceIdKey]: 'test-id',
            startTime: 1576364117792,
            duration: 20,
            spans: [
              {
                [spanIdKey]: 'test-id',
                serviceName: 'test service',
                displaySpanName: 'egress'
              }
            ]
          })
        )
      }),
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'Latency',
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
          entrySpanId: 'test-id',
          timeString: `${new DisplayDatePipe().transform(1576364117792, {
            mode: DateFormatMode.DateAndTimeWithSeconds
          })} for 20 ms`,
          titleString: 'test service egress',
          type: TRACE_SCOPE
        }
      });
    });
  });
});
