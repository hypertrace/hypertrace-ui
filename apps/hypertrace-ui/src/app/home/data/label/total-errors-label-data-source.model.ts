import { Model } from '@hypertrace/hyperdash';
import {
  ExploreSpecification,
  ExploreSpecificationBuilder,
  MetricAggregationType,
  TraceValueDataSourceModel
} from '@hypertrace/observability';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Model({
  type: 'total-errors-label-data-source'
})
export class TotalErrorsLabelDataSourceModel extends TraceValueDataSourceModel<TotalErrorsResult> {
  public specification: ExploreSpecification = new ExploreSpecificationBuilder().exploreSpecificationForKey(
    'errorCount',
    MetricAggregationType.Sum
  );

  public getData(): Observable<TotalErrorsResult> {
    return this.fetchSpecificationData().pipe(
      map(result => ({
        totalErrors: result.value as number
      }))
    );
  }
}

interface TotalErrorsResult {
  totalErrors: number;
}
