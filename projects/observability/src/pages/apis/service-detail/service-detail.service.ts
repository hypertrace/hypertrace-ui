import { Injectable } from '@angular/core';
import { Breadcrumb } from '@hypertrace/common';
import { Entity, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { EntityDetailService } from '../../../shared/services/entity/entity-detail.service';

@Injectable()
export class ServiceDetailService extends EntityDetailService<ServiceEntity> {
  public static readonly SERVICE_ID_PARAM_NAME: string = 'id';

  protected getEntityIdParamName(): string {
    return ServiceDetailService.SERVICE_ID_PARAM_NAME;
  }

  protected getEntityType(): ObservabilityEntityType.Service {
    return ObservabilityEntityType.Service;
  }

  protected getAttributeKeys(): string[] {
    return ['name'];
  }
}

export interface ServiceEntity extends Entity, Breadcrumb {
  name: string;
}
