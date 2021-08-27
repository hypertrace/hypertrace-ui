import { Dictionary } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { TraceStatus } from '../../../../graphql/model/schema/trace';
import { TraceStatusSpecification } from '../../../../graphql/model/specifications/trace-status-specification';
import { SpecificationBuilder } from '../../../../graphql/request/builders/specification/specification-builder';
import { SpecificationModel } from './specification.model';

@Model({
  type: 'trace-status-specification',
  displayName: 'Trace Status'
})
export class TraceStatusSpecificationModel extends SpecificationModel<TraceStatusSpecification> {
  protected buildInnerSpec(): TraceStatusSpecification {
    return new SpecificationBuilder().buildTraceStatusSpecification();
  }

  public extractFromServerData(resultContainer: Dictionary<unknown>): TraceStatus {
    return this.innerSpec.extractFromServerData(resultContainer);
  }
}
