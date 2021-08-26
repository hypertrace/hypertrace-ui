import { Dictionary } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import { Specification, SpecificationModel } from '@hypertrace/observability';
import {
  ExploreSpecification,
  ExploreValue
} from './../../../../../graphql/model/schema/specifications/explore-specification';
import { ExploreSpecificationBuilder } from './../../../../../graphql/request/builders/specification/explore/explore-specification-builder';

@Model({
  type: 'explorer-interval-timestamp-selection',
  displayName: 'Explore Interval Timestamp Seleaction'
})
export class ExploreIntervalTimestampSelectionSpecificationModel extends SpecificationModel<Specification> {
  protected buildInnerSpec(): ExploreSpecification {
    return new ExploreSpecificationBuilder().exploreSpecificationForInterval();
  }

  public extractFromServerData(resultContainer: Dictionary<ExploreValue>): ExploreValue {
    return this.innerSpec.extractFromServerData(resultContainer) as ExploreValue;
  }
}
