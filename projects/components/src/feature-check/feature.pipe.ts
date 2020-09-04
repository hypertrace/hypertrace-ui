import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Pipe({
  name: 'htcFeature',
  // tslint:disable-next-line: no-pipe-impure delegating to impure async pipe
  pure: false
})
export class FeaturePipe implements PipeTransform {
  private lastReceived: unknown;
  private featureState$?: Observable<FeatureState>;
  private readonly asyncPipe: AsyncPipe;

  public constructor(
    private readonly featureStateResolver: FeatureStateResolver,
    changeDetectorRef: ChangeDetectorRef
  ) {
    this.asyncPipe = new AsyncPipe(changeDetectorRef);
  }
  public transform(features: string | string[] | undefined): FeatureState {
    if (this.lastReceived !== features || !this.featureState$) {
      this.lastReceived = features;
      this.featureState$ = this.featureStateResolver
        .getCombinedFeatureState(this.asArray(features))
        .pipe(startWith(FeatureState.Disabled));
    }

    return this.asyncPipe.transform(this.featureState$)!;
  }

  private asArray(features: string | string[] | undefined): string[] {
    if (isNil(features)) {
      return [];
    }
    if (!Array.isArray(features)) {
      return [features];
    }

    return features;
  }
}
