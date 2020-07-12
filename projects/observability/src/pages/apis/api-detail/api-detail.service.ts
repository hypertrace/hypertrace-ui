import { Injectable } from '@angular/core';
import { Entity, ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';
import { EntityDetailService } from '../../../shared/services/entity/entity-detail.service';

@Injectable()
export class ApiDetailService extends EntityDetailService<ApiEntity> {
  public static readonly API_ID_PARAM_NAME: string = 'id';

  protected getEntityIdParamName(): string {
    return ApiDetailService.API_ID_PARAM_NAME;
  }
  protected getEntityType(): ObservabilityEntityType.Api {
    return ObservabilityEntityType.Api;
  }

  protected getAttributeKeys(): string[] {
    return ['apiType'];
  }
}

export interface ApiEntity extends Entity {
  apiType: ApiType;
}

export const enum ApiType {
  Http = 'HTTP',
  Grpc = 'GRPC'
}
