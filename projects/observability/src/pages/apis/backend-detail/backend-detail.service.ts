import { Injectable } from '@angular/core';
import { Entity, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { EntityDetailService } from '../../../shared/services/entity/entity-detail.service';

@Injectable()
export class BackendDetailService extends EntityDetailService<BackendEntity> {
  public static readonly BACKEND_ID_PARAM_NAME: string = 'id';

  protected getEntityIdParamName(): string {
    return BackendDetailService.BACKEND_ID_PARAM_NAME;
  }

  protected getEntityType(): ObservabilityEntityType.Backend {
    return ObservabilityEntityType.Backend;
  }

  protected getAttributeKeys(): string[] {
    return ['name'];
  }
}

export interface BackendEntity extends Entity<ObservabilityEntityType.Backend> {
  name: string;
}
