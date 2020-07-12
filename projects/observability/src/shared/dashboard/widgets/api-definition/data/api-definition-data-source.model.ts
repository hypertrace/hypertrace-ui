import { Dictionary } from '@hypertrace/common';
import { GraphQlDataSourceModel, Specification, SpecificationBuilder } from '@hypertrace/distributed-tracing';
import { Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Entity, entityIdKey, ObservabilityEntityType } from '../../../../graphql/model/schema/entity';
import {
  ENTITY_GQL_REQUEST,
  EntityGraphQlQueryHandlerService
} from '../../../../graphql/request/handlers/entities/query/entity/entity-graphql-query-handler.service';

@Model({
  type: 'trace-api-definition-data-source'
})
export class ApiDefinitionDataSourceModel extends GraphQlDataSourceModel<ApiDefinitionData> {
  @ModelProperty({
    key: 'api-id',
    required: true,
    type: STRING_PROPERTY.type
  })
  public apiId!: string;

  private readonly attributeSpecBuilder: SpecificationBuilder = new SpecificationBuilder();
  private readonly definitionSpecifications: Specification[] = [
    this.attributeSpecBuilder.attributeSpecificationForKey('httpUrl'),
    this.attributeSpecBuilder.attributeSpecificationForKey('pathParamsType'),
    this.attributeSpecBuilder.attributeSpecificationForKey('queryParamsType'),
    this.attributeSpecBuilder.attributeSpecificationForKey('queryParamsPii'),
    this.attributeSpecBuilder.attributeSpecificationForKey('pathParamsPii'),
    this.attributeSpecBuilder.attributeSpecificationForKey('requestBodySchema'),
    this.attributeSpecBuilder.attributeSpecificationForKey('responseBodySchema')
  ];
  public getData(): Observable<ApiDefinitionData> {
    return this.queryWithNextBatch<EntityGraphQlQueryHandlerService>({
      requestType: ENTITY_GQL_REQUEST,
      entityType: ObservabilityEntityType.Api,
      id: this.apiId,
      timeRange: this.getTimeRangeOrThrow(),
      properties: this.definitionSpecifications
    }).pipe(flatMap(trace => this.mapResponseObject(trace)));
  }

  public mapResponseObject(apiEntity: Entity | undefined): Observable<ApiDefinitionData> {
    if (apiEntity === undefined) {
      return EMPTY;
    }

    return of({
      id: apiEntity[entityIdKey],
      uri: apiEntity.httpUrl as string,
      params: this.buildApiParamsList(apiEntity),
      requestBodySchema: apiEntity.requestBodySchema as string,
      responseBodySchema: apiEntity.responseBodySchema as string
    });
  }

  private buildApiParamsList(apiEntity: Entity): ApiParameters[] {
    return [
      ...this.buildApiQueryParamsList(apiEntity),
      ...this.buildApiPathParamsList(apiEntity)
    ].sort((param1, param2) => param1.name.localeCompare(param2.name));
  }

  private buildApiQueryParamsList(apiEntity: Entity): ApiParameters[] {
    const rawQueryParams = apiEntity.queryParamsType as Dictionary<unknown>;
    const rawQueryPiiParams = apiEntity.queryParamsPii as Dictionary<unknown>;

    const queryParams: ApiParameters[] = [];

    Object.keys(rawQueryParams).forEach(key =>
      queryParams.push({
        name: key,
        valueType: rawQueryParams[key] as string,
        parameterType: ApiParamType.Query,
        pii: rawQueryPiiParams[key] !== undefined ? (rawQueryPiiParams[key] as string) : ''
      })
    );

    return queryParams;
  }

  private buildApiPathParamsList(apiEntity: Entity): ApiParameters[] {
    const rawPathParams = apiEntity.pathParamsType as Dictionary<unknown>;
    const rawPathPiiParams = apiEntity.pathParamsPii as Dictionary<unknown>;

    const pathParams: ApiParameters[] = [];

    Object.keys(rawPathParams).forEach(key =>
      pathParams.push({
        name: key,
        valueType: rawPathParams[key] as string,
        parameterType: ApiParamType.Path,
        pii: rawPathPiiParams[key] !== undefined ? (rawPathPiiParams[key] as string) : ''
      })
    );

    return pathParams;
  }
}

export interface ApiDefinitionData {
  id: string;
  uri: string;
  params: ApiParameters[];
  requestBodySchema: string;
  responseBodySchema: string;
}

export interface ApiParameters {
  name: string;
  valueType: string;
  parameterType: ApiParamType;
  pii: string;
}

export enum ApiParamType {
  Query = 'Query',
  Path = 'Path'
}
