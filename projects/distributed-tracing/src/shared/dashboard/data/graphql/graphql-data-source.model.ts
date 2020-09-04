import {
  ARRAY_PROPERTY,
  DataSource,
  dataSourceMarker,
  ModelApi,
  ModelEventPublisher,
  ModelProperty
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';

import { GraphQlQueryHandler, RequestTypeForHandler, ResponseTypeForHandler } from '@hypertrace/graphql-client';
import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { GraphQlFilter, GraphQlFilterable } from '../../../graphql/model/schema/filter/graphql-filter';
import { GraphQlTimeRange } from '../../../graphql/model/schema/timerange/graphql-time-range';
import { GraphQlQueryEventService, ObservedGraphQlRequest } from './graphql-query-event.service';

export abstract class GraphQlDataSourceModel<TData> implements DataSource<TData>, GraphQlFilterable {
  public readonly dataSourceMarker: typeof dataSourceMarker = dataSourceMarker;
  private readonly querySubject: Subject<ObservedGraphQlRequest> = new Subject();

  @ModelEventPublisher(GraphQlQueryEventService)
  public readonly query$: Observable<ObservedGraphQlRequest> = this.querySubject.asObservable();

  @ModelProperty({
    key: 'filters',
    type: ARRAY_PROPERTY.type
  })
  public filters: GraphQlFilter[] = [];

  @ModelInject(MODEL_API)
  public api!: ModelApi;
  public abstract getData(): Observable<TData>;

  public getFilters(inherited: GraphQlFilter[]): GraphQlFilter[] {
    return [...inherited, ...this.filters];
  }

  protected getTimeRangeOrThrow(): GraphQlTimeRange {
    const dashboardTimeRange = this.api.getTimeRange();

    if (dashboardTimeRange) {
      return new GraphQlTimeRange(dashboardTimeRange.startTime, dashboardTimeRange.endTime);
    }

    throw Error('Attempted to use time range for dashboard, but time range unset');
  }

  public query<
    THandler extends GraphQlQueryHandler<unknown, unknown>,
    TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
  >(requestOrBuilder: RequestOrBuilder<RequestTypeForHandler<THandler>>): Observable<TResponse> {
    const resultSubject = new ReplaySubject<TResponse>();

    this.querySubject.next({
      buildRequest: this.convertToBuilder(requestOrBuilder),
      isolated: true,
      responseObserver: resultSubject as Observer<unknown>
    });

    return resultSubject.asObservable();
  }

  private convertToBuilder<THandler extends GraphQlQueryHandler<unknown, unknown>>(
    requestOrBuilder: RequestOrBuilder<RequestTypeForHandler<THandler>>
  ): RequestBuilder<RequestTypeForHandler<THandler>> {
    if (typeof requestOrBuilder === 'function') {
      return requestOrBuilder as RequestBuilder<RequestTypeForHandler<THandler>>;
    }

    return () => requestOrBuilder;
  }
}

type RequestBuilder<T> = (filters: GraphQlFilter[]) => T;

type RequestOrBuilder<T> = T | RequestBuilder<T>;
