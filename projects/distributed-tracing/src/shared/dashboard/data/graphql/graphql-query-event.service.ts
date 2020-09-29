import { Injectable } from '@angular/core';
import {
  GraphQlQueryHandler,
  GraphQlRequestService,
  RequestTypeForHandler,
  ResponseTypeForHandler
} from '@hypertrace/graphql-client';
import { ModelScopedDashboardEvent, ModelScopedData } from '@hypertrace/hyperdash';
import {
  DashboardEventManagerService,
  DataSourceManagerService,
  ModelDestroyedEventService
} from '@hypertrace/hyperdash-angular';
import { Observable, Observer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GraphQlFilter, GraphQlFilterable } from '../../../graphql/model/schema/filter/graphql-filter';

@Injectable({
  providedIn: 'root'
})
export class GraphQlQueryEventService extends ModelScopedDashboardEvent<ObservedGraphQlRequest> {
  public constructor(
    dashboardEventManager: DashboardEventManagerService,
    private readonly modelDestroyedEvent: ModelDestroyedEventService,
    private readonly graphqlQueryService: GraphQlRequestService,
    private readonly dataSourceManager: DataSourceManagerService
  ) {
    super(dashboardEventManager);

    this.getObservable().subscribe(event => this.onQueryEvent(event));
  }

  protected onQueryEvent(event: RequestEvent): void {
    this.delegateQuery(event)
      .pipe(takeUntil(this.modelDestroyedEvent.getDestructionObservable(event.source)))
      .subscribe(event.data.responseObserver);
  }

  protected delegateQuery(event: RequestEvent): Observable<unknown> {
    const request = event.data.buildRequest(this.collectFilters(event.source));

    return this.graphqlQueryService.query(request);
  }

  private collectFilters(source: object): GraphQlFilter[] {
    let currentSource: object | undefined = source;
    const collectedDataSources: GraphQlFilterable[] = [];

    while (currentSource) {
      if (this.isFilterable(currentSource)) {
        // Collect each filterable data source such that inherited always come before their descendents
        collectedDataSources.unshift(currentSource);
      }
      currentSource = this.dataSourceManager.getClosest(currentSource);
    }

    return collectedDataSources.reduce<GraphQlFilter[]>(
      (inherited, filterable) => filterable.getFilters(inherited),
      []
    );
  }

  private isFilterable(obj: Partial<GraphQlFilterable>): obj is GraphQlFilterable {
    return typeof obj.getFilters === 'function';
  }
}

export interface ObservedGraphQlRequest<
  THandler extends GraphQlQueryHandler<unknown, unknown> = GraphQlQueryHandler<unknown, unknown>,
  TResponse extends ResponseTypeForHandler<THandler> = ResponseTypeForHandler<THandler>
> {
  responseObserver: Observer<TResponse>;
  isolated?: boolean;
  buildRequest(inheritedFilters: GraphQlFilter[]): RequestTypeForHandler<THandler>;
}

type RequestEvent = ModelScopedData<ObservedGraphQlRequest>;
