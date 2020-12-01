import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { TraceType } from '../../../../graphql/model/schema/trace';
import {
  TracesGraphQlQueryHandlerService,
  TracesResponse,
  TRACES_GQL_REQUEST
} from '../../../../graphql/request/handlers/traces/traces-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { AttributeSpecificationModel } from '../specifiers/attribute-specification.model';

@Model({
  type: 'traces-data-source'
})
export class TracesDataSourceModel extends GraphQlDataSourceModel<TracesResponse> {
  @ModelProperty({
    key: 'trace',
    required: true,
    type: STRING_PROPERTY.type
  })
  public traceType!: TraceType;

  @ModelProperty({
    key: 'attributes',
    type: ARRAY_PROPERTY.type,
    required: false
  })
  public attributeSpecifications: AttributeSpecificationModel[] = [];

  public getData(): Observable<TracesResponse> {
    return this.query<TracesGraphQlQueryHandlerService>({
      requestType: TRACES_GQL_REQUEST,
      traceType: this.traceType,
      timeRange: this.getTimeRangeOrThrow(),
      properties: this.attributeSpecifications,
      limit: 100
    });
  }
}
