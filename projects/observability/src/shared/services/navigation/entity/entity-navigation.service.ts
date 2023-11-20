import { Inject, Injectable } from '@angular/core';
import { InAppNavigationParams, NavigationParamsType, NavigationService } from '@hypertrace/common';
import { Observable, throwError } from 'rxjs';
import { EntityMetadataMap, ENTITY_METADATA } from '../../../constants/entity-metadata';
import { Entity, entityIdKey, EntityType, entityTypeKey } from '../../../graphql/model/schema/entity';

@Injectable({ providedIn: 'root' })
export class EntityNavigationService {
  public constructor(
    private readonly navigationService: NavigationService,
    @Inject(ENTITY_METADATA) private readonly entityMetadata: EntityMetadataMap,
  ) {
    Array.from(this.entityMetadata.values()).forEach(item => {
      this.registerEntityNavigationAction(item.entityType, (id, sourceRoute, inactive) => ({
        navType: NavigationParamsType.InApp,
        path: ['/', ...item.detailPath(id, sourceRoute, inactive)],
      }));
    });
  }

  private readonly entityNavigationMap: Map<
    EntityType,
    (id: string, sourceRoute?: string, inactive?: boolean) => InAppNavigationParams
  > = new Map();

  public navigateToEntity(entity: Entity, isInactive?: boolean): Observable<boolean> {
    const entityType = entity[entityTypeKey];
    const navigationParams = this.buildEntityDetailNavigationParams(entity, isInactive);

    return navigationParams
      ? this.navigationService.navigate(navigationParams)
      : throwError(`Requested entity type not registered for navigation: ${entityType}`);
  }

  public buildEntityDetailNavigationParams(entity: Entity, isInactive?: boolean): InAppNavigationParams | undefined {
    const entityType = entity[entityTypeKey];
    const entityId = entity[entityIdKey];
    const navigationFunction = this.entityNavigationMap.get(entityType);

    // If there are parent root routes specified and the request URL is in that route's context,
    // Supply that root route to the navigation function
    const entityMetadata = this.entityMetadata.get(entityType);
    const sourceRoute: string | undefined = entityMetadata?.sourceRoutes?.find(item =>
      this.navigationService.isRelativePathActive([item], this.navigationService.rootRoute()),
    );

    return navigationFunction ? navigationFunction(entityId, sourceRoute, isInactive) : undefined;
  }

  public registerEntityNavigationAction(
    entityType: EntityType,
    action: (id: string, sourceRoute?: string, inactive?: boolean) => InAppNavigationParams,
  ): void {
    this.entityNavigationMap.set(entityType, action);
  }
}
