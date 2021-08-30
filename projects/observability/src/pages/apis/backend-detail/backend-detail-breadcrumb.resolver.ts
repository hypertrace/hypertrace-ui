import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Breadcrumb, TimeRangeService } from '@hypertrace/common';
import { ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST
} from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { GraphQlTimeRange } from '../../../shared/graphql/model/schema/timerange/graphql-time-range';
import { SpecificationBuilder } from '../../../shared/graphql/request/builders/specification/specification-builder';
import { EntityIconLookupService } from '../../../shared/services/entity/entity-icon-lookup.service';
import { BackendEntity } from './backend-detail.service';

@Injectable({ providedIn: 'root' })
export class BackendDetailBreadcrumbResolver implements Resolve<Observable<Breadcrumb>> {
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
        map(backend => ({
          label: backend.name,
          icon: this.iconLookupService.forBackendEntity(backend, this.getBackendTypeAttributeName()),
          alwaysShowIcon: true
        }))
      )
    );
  }

  private fetchEntity(id: string): Observable<BackendEntity> {
    return this.timeRangeService.getTimeRangeAndChanges().pipe(
      switchMap(timeRange =>
        this.graphQlQueryService.query<EntityGraphQlQueryHandlerService, BackendEntity>({
          requestType: ENTITY_GQL_REQUEST,
          entityType: ObservabilityEntityType.Backend,
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
    return ['name', this.getBackendTypeAttributeName()];
  }

  private getBackendTypeAttributeName(): string {
    return 'type';
  }
}
