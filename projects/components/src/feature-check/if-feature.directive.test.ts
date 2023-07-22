import { FeatureState } from '@hypertrace/common';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { IfFeatureDirective } from './if-feature.directive';

describe('If feature directive', () => {
  let spectator: SpectatorDirective<IfFeatureDirective, IfFeatureHost>;
  const createHost = createDirectiveFactory({
    directive: IfFeatureDirective
  });

  const getTestDiv = () => spectator.query('.test-div');
  const getElseDiv = () => spectator.query('.else-div');

  beforeEach(() => {
    spectator = createHost(
      `
      <ng-container *htIfFeature="state as featureState; else elseTemplate">
        <div class="test-div">{{featureState}}</div>
      </ng-container>
      <ng-template #elseTemplate>
        <div class="else-div">Else template</div>
      </ng-template>
      `
    );
  });

  test('does not render template if feature disabled and renders else template if present', () => {
    spectator.setHostInput({
      state: FeatureState.Disabled
    });
    expect(getTestDiv()).not.toExist();
    expect(getElseDiv()).toExist();

    spectator.setHostInput({
      state: FeatureState.Enabled
    });
    expect(getTestDiv()).toExist();
    expect(getElseDiv()).not.toExist();

    spectator.setHostInput({
      state: FeatureState.Disabled
    });
    expect(getTestDiv()).not.toExist();
    expect(getElseDiv()).toExist();
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

    spectator.setHostInput({
      state: FeatureState.Disabled
    });
    expect(getElseDiv()).toHaveText('Else template');
  });
});

interface IfFeatureHost {
  state?: FeatureState;
}
//
