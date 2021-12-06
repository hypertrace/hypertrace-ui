import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Breadcrumb, NavigationService, TimeRangeService } from '@hypertrace/common';
import { BreadcrumbsService } from '@hypertrace/components';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EntityMetadata, EntityMetadataMap, ENTITY_METADATA } from '../../../shared/constants/entity-metadata';
import {
  Entity,
  entityIdKey,
  entityTypeKey,
  ObservabilityEntityType
} from '../../../shared/graphql/model/schema/entity';
import {
  EntityBreadcrumb,
  EntityBreadcrumbResolver
} from '../../../shared/services/entity-breadcrumb/entity-breadcrumb.resolver';
import { EntityIconLookupService } from './../../../shared/services/entity/entity-icon-lookup.service';

@Injectable({ providedIn: 'root' })
export class ApiDetailBreadcrumbResolver<T extends EntityBreadcrumb> extends EntityBreadcrumbResolver<T> {
  protected readonly apiEntityMetadata: EntityMetadata | undefined;

  public constructor(
    timeRangeService: TimeRangeService,
    graphQlQueryService: GraphQlRequestService,
    iconLookupService: EntityIconLookupService,
    private readonly navigationService: NavigationService,
    protected readonly breadcrumbService: BreadcrumbsService,
    @Inject(ENTITY_METADATA) private readonly entityMetadataMap: EntityMetadataMap
  ) {
    super(timeRangeService, graphQlQueryService, iconLookupService);
    this.apiEntityMetadata = this.entityMetadataMap.get(ObservabilityEntityType.Api);
  }

  public async resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Promise<Observable<Breadcrumb>> {
    const id = activatedRouteSnapshot.paramMap.get('id') as string;
    const parentEntityMetadata = this.resolveParentType();

    return Promise.resolve(
      this.fetchEntity(id, ObservabilityEntityType.Api).pipe(
        map(apiEntity => ({
          ...apiEntity,
          ...this.getParentPartial(apiEntity, parentEntityMetadata)
        })),
        switchMap(api => [
          ...this.getParentBreadcrumbs(api, parentEntityMetadata),
          this.createBreadcrumbForEntity(api, activatedRouteSnapshot)
        ])
      )
    );
  }

  protected createBreadcrumbForEntity(api: Entity, activatedRouteSnapshot: ActivatedRouteSnapshot): EntityBreadcrumb {
    return {
      ...api,
      label: api.name as string,
      icon: this.apiEntityMetadata?.icon,
      url: this.breadcrumbService.getPath(activatedRouteSnapshot)
    };
  }

  protected getParentBreadcrumbs(
    api: EntityBreadcrumb,
    parentEntityMetadata?: EntityMetadata
  ): (EntityBreadcrumb | Breadcrumb)[] {
    return parentEntityMetadata !== undefined
      ? [
          {
            [entityIdKey]: api.parentId as string,
            [entityTypeKey]: parentEntityMetadata.entityType,
            label: api.parentName as string,
            icon: parentEntityMetadata?.icon,
            url: parentEntityMetadata?.detailPath(api.parentId as string)
          },
          {
            label: 'Endpoints',
            icon: this.apiEntityMetadata?.icon,
            url: parentEntityMetadata?.apisListPath?.(api.parentId as string)
          }
        ]
      : [];
  }

  protected getAttributeKeys(): string[] {
    const parentTypeMetadata = this.resolveParentType();
    const parentAttributes = parentTypeMetadata
      ? [this.getParentNameAttribute(parentTypeMetadata), this.getParentIdAttribute(parentTypeMetadata)]
      : [];

    return ['name', ...this.getExtraAttributeKeys(), ...parentAttributes];
  }

  protected getExtraAttributeKeys(): string[] {
    return [];
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

  protected resolveParentType(): EntityMetadata | undefined {
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

export interface ApiBreadcrumbDetails extends EntityBreadcrumb {
  name: string;
  parentName: string;
  parentId: string;
}
