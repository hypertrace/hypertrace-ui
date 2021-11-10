import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TimeRangeService } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { Observable } from 'rxjs';
import { ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { EntityBreadcrumbResolver } from '../../../shared/services/entity-breadcrumb/entity-breadcrumb.resolver';
import { EntityIconLookupService } from './../../../shared/services/entity/entity-icon-lookup.service';
import { ServiceEntity } from './service-detail.service';

@Injectable({ providedIn: 'root' })
export class ServiceDetailBreadcrumbResolver<T extends ServiceEntity> extends EntityBreadcrumbResolver<T> {
  public constructor(
    timeRangeService: TimeRangeService,
    graphQlQueryService: GraphQlRequestService,
    iconLookupService: EntityIconLookupService
  ) {
    super(timeRangeService, graphQlQueryService, iconLookupService);
  }

  public async resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Promise<Observable<T>> {
    const id = activatedRouteSnapshot.paramMap.get('id');

    return Promise.resolve(this.fetchEntity(id as string, ObservabilityEntityType.Service));
  }

  protected getAttributeKeys(): string[] {
    return ['name'];
  }
}
