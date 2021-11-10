import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Breadcrumb, TimeRangeService } from '@hypertrace/common';
import { GraphQlRequestCacheability, GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Entity } from '../../graphql/model/schema/entity';
import { GraphQlTimeRange } from '../../graphql/model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../graphql/request/builders/specification/specification-builder';
import { EntityGraphQlQueryHandlerService } from '../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityIconLookupService } from '../entity/entity-icon-lookup.service';
import { Specification } from './../../graphql/model/schema/specifier/specification';
import { ENTITY_GQL_REQUEST } from './../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

export abstract class EntityBreadcrumbResolver<T extends Entity> implements Resolve<Observable<Breadcrumb>> {
  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();

  public constructor(
    protected readonly timeRangeService: TimeRangeService,
    protected readonly graphQlQueryService: GraphQlRequestService,
    protected readonly iconLookupService: EntityIconLookupService
  ) {}

  public abstract resolve(route: ActivatedRouteSnapshot): Promise<Observable<Breadcrumb>>;

  protected abstract getAttributeKeys(): string[];

  protected getAdditionalSpecifications(): Specification[] {
    return [];
  }

  protected fetchEntity(id: string, entityType: string): Observable<T & Breadcrumb> {
    return this.timeRangeService.getTimeRangeAndChanges().pipe(
      switchMap(timeRange =>
        this.graphQlQueryService.query<EntityGraphQlQueryHandlerService, T>(
          {
            requestType: ENTITY_GQL_REQUEST,
            entityType: entityType,
            id: id,
            properties: [...this.getAttributeSpecification(), ...this.getAdditionalSpecifications()],
            timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime)
          },
          { cacheability: GraphQlRequestCacheability.NotCacheable }
        )
      ),
      map(entity => ({
        ...entity,
        label: entity.name as string,
        icon: this.iconLookupService.forEntity(entity)
      })),
      take(1)
    );
  }

  private getAttributeSpecification(): Specification[] {
    return this.getAttributeKeys().map(attributeKey =>
      this.specificationBuilder.attributeSpecificationForKey(attributeKey)
    );
  }
}
