import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Breadcrumb, NavigationService, TimeRangeService } from '@hypertrace/common';
import { BreadcrumbsService } from '@hypertrace/components';
import { GraphQlTimeRange, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EntityMetadata, EntityMetadataMap, ENTITY_METADATA } from '../../../shared/constants/entity-metadata';
import { Entity, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import {
  EntityGraphQlQueryHandlerService,
  ENTITY_GQL_REQUEST
} from '../../../shared/graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class ApiDetailBreadcrumbResolver implements Resolve<Observable<Breadcrumb>> {
  private readonly specificationBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly apiEntityMetadata: EntityMetadata | undefined;

  public constructor(
    private readonly navigationService: NavigationService,
    private readonly timeRangeService: TimeRangeService,
    private readonly graphQlQueryService: GraphQlRequestService,
    private readonly breadcrumbService: BreadcrumbsService,
    @Inject(ENTITY_METADATA) private readonly entityMetadataMap: EntityMetadataMap
  ) {
    this.apiEntityMetadata = this.entityMetadataMap.get(ObservabilityEntityType.Api);
  }

  public async resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Promise<Observable<Breadcrumb>> {
    const id = activatedRouteSnapshot.paramMap.get('id') as string;
    const parentType = this.resolveParentType();

    return Promise.resolve(
      this.fetchEntity(id, parentType).pipe(
        take(1),
        switchMap(api => [
          ...this.getParentBreadcrumbs(api, parentType),
          {
            label: api.name,
            icon: this.apiEntityMetadata?.icon,
            url: this.breadcrumbService.getPath(activatedRouteSnapshot)
          }
        ])
      )
    );
  }

  private getParentBreadcrumbs(api: ApiBreadcrumbDetails, parentEntityMetadata?: EntityMetadata): Breadcrumb[] {
    return parentEntityMetadata !== undefined
      ? [
          {
            label: api.parentName,
            icon: parentEntityMetadata?.icon,
            url: parentEntityMetadata?.detailPath(api.parentId)
          },
          {
            label: 'Endpoints',
            icon: this.apiEntityMetadata?.icon,
            url: parentEntityMetadata?.apisListPath?.(api.parentId)
          }
        ]
      : [];
  }

  private fetchEntity(id: string, parentEntityMetadata?: EntityMetadata): Observable<ApiBreadcrumbDetails> {
    return this.timeRangeService.getTimeRangeAndChanges().pipe(
      switchMap(timeRange =>
        this.graphQlQueryService.query<EntityGraphQlQueryHandlerService, ApiBreadcrumbDetails>({
          requestType: ENTITY_GQL_REQUEST,
          entityType: ObservabilityEntityType.Api,
          id: id,
          properties: this.getAttributeKeys(parentEntityMetadata).map(attributeKey =>
            this.specificationBuilder.attributeSpecificationForKey(attributeKey)
          ),
          timeRange: new GraphQlTimeRange(timeRange.startTime, timeRange.endTime)
        })
      ),
      map(apiEntity => ({
        ...apiEntity,
        ...this.getParentPartial(apiEntity, parentEntityMetadata)
      }))
    );
  }

  private getAttributeKeys(parentTypeMetadata?: EntityMetadata): string[] {
    const parentAttributes = parentTypeMetadata
      ? [this.getParentNameAttribute(parentTypeMetadata), this.getParentIdAttribute(parentTypeMetadata)]
      : [];

    return ['name', ...parentAttributes];
  }

  private getParentPartial(
    entity: Entity,
    parentTypeMetadata?: EntityMetadata
  ): Partial<Pick<ApiBreadcrumbDetails, 'parentName' | 'parentId'>> {
    if (!parentTypeMetadata) {
      return {};
    }

    return {
      parentId: entity[this.getParentIdAttribute(parentTypeMetadata)] as string,
      parentName: entity[this.getParentNameAttribute(parentTypeMetadata)] as string
    };
  }

  private resolveParentType(): EntityMetadata | undefined {
    const sourceRoute = this.apiEntityMetadata?.sourceRoutes?.find(item =>
      this.navigationService.isRelativePathActive([item], this.navigationService.rootRoute())
    );

    if (sourceRoute === undefined) {
      return undefined;
    }

    return Array.from(this.entityMetadataMap.values()).find(item => item.listPath?.[0] === sourceRoute);
  }

  protected getParentNameAttribute(_parentTypeMetadata: EntityMetadata): string {
    return 'serviceName';
  }

  protected getParentIdAttribute(_parentTypeMetadata: EntityMetadata): string {
    return 'serviceId';
  }
}

interface ApiBreadcrumbDetails extends Entity<ObservabilityEntityType.Api> {
  name: string;
  parentName: string;
  parentId: string;
}
