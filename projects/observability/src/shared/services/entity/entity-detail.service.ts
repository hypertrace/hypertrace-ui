import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplayObservable, TimeRangeService } from '@hypertrace/common';
import {
  GraphQlFilter,
  GraphQlFilterDataSourceModel,
  GraphQlTimeRange,
  Specification,
  SpecificationBuilder
} from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Dashboard } from '@hypertrace/hyperdash';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { concatMap, map, shareReplay, takeUntil } from 'rxjs/operators';
import { Entity, EntityType } from '../../graphql/model/schema/entity';
import { GraphQlEntityFilter } from '../../graphql/model/schema/filter/entity/graphql-entity-filter';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST
} from '../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

@Injectable()
export abstract class EntityDetailService<T extends Entity> implements OnDestroy {
  public readonly entityFilter$: ReplayObservable<GraphQlEntityFilter>;
  private readonly entityId$: ReplayObservable<string>;
  private readonly entity$: ReplayObservable<T>;
  private readonly destroyed$: Subject<void> = new Subject();
  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();

  public constructor(
    private readonly timeRangeService: TimeRangeService,
    route: ActivatedRoute,
    graphQlQueryService: GraphQlRequestService
  ) {
    this.entityId$ = route.paramMap.pipe(
      map(paramMap => paramMap.get(this.getEntityIdParamName())!),
      takeUntil(this.destroyed$),
      shareReplay(1)
    );

    this.entity$ = combineLatest([this.entityId$, this.timeRangeService.getTimeRangeAndChanges()]).pipe(
      concatMap(([entityId, timeRange]) =>
        graphQlQueryService.queryImmediately<EntityGraphQlQueryHandlerService, T>({
          requestType: ENTITY_GQL_REQUEST,
          entityType: this.getEntityType(),
          id: entityId,
          properties: this.getAttributeSpecifications(),
          timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime)
        })
      ),
      takeUntil(this.destroyed$),
      shareReplay(1)
    );

    this.entityFilter$ = this.entityId$.pipe(map(id => new GraphQlEntityFilter(id, this.getEntityType())));
  }

  protected abstract getEntityIdParamName(): string;
  protected abstract getEntityType(): EntityType;
  protected abstract getAttributeKeys(): string[];

  public getEntity(): ReplayObservable<T> {
    return this.entity$;
  }

  public getEntityId(): ReplayObservable<string> {
    return this.entityId$;
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public applyFiltersToDashboard(dashboard: Dashboard, filters: GraphQlFilter[] = []): Subscription {
    return this.entityFilter$.subscribe(entityFilter => {
      const rootDataSource = dashboard.getRootDataSource<GraphQlFilterDataSourceModel>();
      rootDataSource && rootDataSource.clearFilters().addFilters(entityFilter, ...filters);
      dashboard.refresh();
    });
  }

  protected getAttributeSpecifications(): Specification[] {
    return this.getAttributeKeys().map(attributeKey =>
      this.specificationBuilder.attributeSpecificationForKey(attributeKey)
    );
  }
}
