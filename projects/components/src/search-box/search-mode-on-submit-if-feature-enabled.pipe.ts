import { Pipe, PipeTransform } from '@angular/core';
import { FeatureState } from '@hypertrace/common';
import { SearchBoxEmitMode } from './search-box.component';

@Pipe({
  name: 'htSearchModeOnSubmitIfEnabled',
  // tslint:disable-next-line: no-pipe-impure delegating to impure async pipe
  pure: false
})
export class SearchModeOnSubmitIfEnabledPipe implements PipeTransform {
  public transform(featureState: FeatureState): SearchBoxEmitMode {
    return featureState === FeatureState.Enabled ? SearchBoxEmitMode.OnSubmit : SearchBoxEmitMode.Incremental;
  }
}
