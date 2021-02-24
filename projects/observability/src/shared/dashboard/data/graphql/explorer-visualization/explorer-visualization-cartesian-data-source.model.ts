import { TimeDuration } from '@hypertrace/common';
import { Model } from '@hypertrace/hyperdash';
import {
  ExploreRequestState,
  ExploreVisualizationRequest
} from '../../../../components/explore-query-editor/explore-visualization-builder';
import { ExploreCartesianDataSourceModel } from '../explore/explore-cartesian-data-source.model';

@Model({
  type: 'explorer-visualization-cartesian-data-source'
})
export class ExplorerVisualizationCartesianDataSourceModel extends ExploreCartesianDataSourceModel {
  public request?: ExploreVisualizationRequest;

  protected buildRequestState(interval: TimeDuration | 'AUTO' = 'AUTO'): ExploreRequestState | undefined {
    if (this.request?.series.length === 0 || this.request?.context === undefined) {
      return undefined;
    }

    return {
      series: this.request.series,
      context: this.request.context,
      interval: interval,
      groupBy: this.request.groupBy,
      groupByLimit: this.request.groupByLimit
    };
  }
}
