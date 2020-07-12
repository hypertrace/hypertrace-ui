import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Breadcrumb, TimeRangeService } from '@hypertrace/common';
import { GraphQlTimeRange, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import {
  ENTITY_GQL_REQUEST,
  EntityGraphQlQueryHandlerService
} from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';
import { EntityIconLookupService } from '../../../shared/services/entity/entity-icon-lookup.service';
import { ServiceEntity } from './service-detail.service';

@Injectable({ providedIn: 'root' })
export class ServiceDetailBreadcrumbResolver implements Resolve<Observable<Breadcrumb>> {
  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();

  public constructor(
    private readonly timeRangeService: TimeRangeService,
    private readonly graphQlQueryService: GraphQlRequestService,
    private readonly iconLookupService: EntityIconLookupService
  ) {}

  public async resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Promise<Observable<Breadcrumb>> {
    const id = activatedRouteSnapshot.paramMap.get('id');

    return Promise.resolve(
      this.fetchEntity(id as string).pipe(
        take(1),
        map(service => ({
          label: service.name,
          icon: this.iconLookupService.forEntity(service)
        }))
      )
    );
  }

  private fetchEntity(id: string): Observable<ServiceEntity> {
    return this.timeRangeService.getTimeRangeAndChanges().pipe(
      switchMap(timeRange =>
        this.graphQlQueryService.queryDebounced<EntityGraphQlQueryHandlerService, ServiceEntity>({
          requestType: ENTITY_GQL_REQUEST,
          entityType: ObservabilityEntityType.Service,
          id: id,
          properties: this.getAttributeKeys().map(attributeKey =>
            this.specificationBuilder.attributeSpecificationForKey(attributeKey)
          ),
          timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime)
        })
      )
    );
  }

  private getAttributeKeys(): string[] {
    return ['name'];
  }
}
