import { Injectable } from '@angular/core';
import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class FeatureResolverService extends FeatureStateResolver {
  public getFeatureState(_: string): Observable<FeatureState> {
    return of(FeatureState.Enabled);
  }
}
