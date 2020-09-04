import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FeaturePipe } from './feature.pipe';

describe('Feature pipe', () => {
  let spectator: SpectatorHost<unknown, FeatureHost>;
  let featureState$: Observable<FeatureState>;
  let getCombinedFeatureStateMock: jest.Mock<Observable<FeatureState>>;
  const createHost = createHostFactory({
    component: Component({
      selector: 'pipe-holder',
      template: '<ng-content></ng-content>'
    })(class {}),
    declarations: [FeaturePipe],
    providers: [
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: jest.fn(() => featureState$)
      })
    ]
  });

  beforeEach(() => {
    featureState$ = EMPTY;
    spectator = createHost(`
    <pipe-holder>{{ features | htFeature }}</pipe-holder>`);
    getCombinedFeatureStateMock = spectator.inject(FeatureStateResolver).getCombinedFeatureState;
    getCombinedFeatureStateMock.mockClear();
  });

  test('returns the resolved feature state', () => {
    featureState$ = of(FeatureState.Preview);
    spectator.setHostInput({
      features: ['test-feature-1', 'test-feature-2']
    });
    expect(spectator.element).toHaveExactText(FeatureState.Preview);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledWith(['test-feature-1', 'test-feature-2']);
  });

  test('handles single feature', () => {
    featureState$ = of(FeatureState.Preview);
    spectator.setHostInput({
      features: 'test-feature-1'
    });
    expect(spectator.element).toHaveExactText(FeatureState.Preview);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledWith(['test-feature-1']);
  });

  test('updates the feature state async', fakeAsync(() => {
    featureState$ = merge(of(FeatureState.Preview), of(FeatureState.Enabled).pipe(delay(5)));
    spectator.setHostInput({
      features: 'test-feature'
    });

    expect(spectator.element).toHaveExactText(FeatureState.Preview);
    spectator.tick(5);
    expect(spectator.element).toHaveExactText(FeatureState.Enabled);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledTimes(1);
  }));

  test('handles changing features', fakeAsync(() => {
    featureState$ = merge(of(FeatureState.Preview), of(FeatureState.Enabled).pipe(delay(5)));
    spectator.setHostInput({
      features: 'test-feature-1'
    });

    expect(spectator.element).toHaveExactText(FeatureState.Preview);

    featureState$ = of(FeatureState.Disabled);
    spectator.setHostInput({
      features: 'test-feature-2'
    });

    expect(spectator.element).toHaveExactText(FeatureState.Disabled);

    spectator.tick(5);
    expect(spectator.element).toHaveExactText(FeatureState.Disabled);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledTimes(2);
    expect(getCombinedFeatureStateMock).toHaveBeenLastCalledWith(['test-feature-2']);
  }));

  test('handles empty features', () => {
    featureState$ = of(FeatureState.Enabled);
    spectator.setHostInput({
      features: []
    });
    expect(spectator.element).toHaveExactText(FeatureState.Enabled);
    expect(getCombinedFeatureStateMock).toHaveBeenLastCalledWith([]);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledTimes(1);
    spectator.setHostInput({
      features: undefined
    });
    expect(spectator.element).toHaveExactText(FeatureState.Enabled);

    expect(getCombinedFeatureStateMock).toHaveBeenLastCalledWith([]);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledTimes(2);

    spectator.setHostInput({
      // tslint:disable-next-line: no-null-keyword
      features: null
    });
    expect(spectator.element).toHaveExactText(FeatureState.Enabled);

    expect(getCombinedFeatureStateMock).toHaveBeenLastCalledWith([]);
    expect(getCombinedFeatureStateMock).toHaveBeenCalledTimes(3);
  });
});

interface FeatureHost {
  features?: string[] | string | null;
}
