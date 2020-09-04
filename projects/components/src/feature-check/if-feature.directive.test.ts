import { FeatureState } from '@hypertrace/common';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { IfFeatureDirective } from './if-feature.directive';

describe('If feature directive', () => {
  let spectator: SpectatorDirective<IfFeatureDirective, IfFeatureHost>;
  const createHost = createDirectiveFactory({
    directive: IfFeatureDirective
  });

  const getTestDiv = () => spectator.query('.test-div');

  beforeEach(() => {
    spectator = createHost(`<div class="test-div" *htcIfFeature="state as featureState">{{featureState}}</div>`);
  });

  test('does not render template if feature disabled', () => {
    spectator.setHostInput({
      state: FeatureState.Disabled
    });
    expect(getTestDiv()).not.toExist();
    spectator.setHostInput({
      state: FeatureState.Enabled
    });

    expect(getTestDiv()).toExist();
    spectator.setHostInput({
      state: FeatureState.Disabled
    });
    expect(getTestDiv()).not.toExist();
  });

  test('provides feature state variable in context when rendered', () => {
    spectator.setHostInput({
      state: FeatureState.Enabled
    });
    expect(getTestDiv()).toHaveText(FeatureState.Enabled);

    spectator.setHostInput({
      state: FeatureState.Preview
    });
    expect(getTestDiv()).toHaveText(FeatureState.Preview);
  });
});

interface IfFeatureHost {
  state?: FeatureState;
}
