import { IconType } from '@hypertrace/assets-library';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { LabelComponent } from '../label/label.component';
import { MetricCardV2Component } from './metric-card-v2.component';

describe('Metric Card V2 Component', () => {
  const createComponent = createComponentFactory({
    component: MetricCardV2Component,
    declarations: [MockComponent(IconComponent), MockComponent(LabelComponent)],
    shallow: true
  });

  test('should render everything correctly', () => {
    const spectator = createComponent({
      props: {
        value: 123,
        text: 'test text',
        icon: IconType.Add
      }
    });

    expect(spectator.query('.metric-card')).toExist();
    expect(spectator.query('.value')).toHaveText('123');
    expect(spectator.query(LabelComponent)?.label).toBe('test text');
    expect(spectator.query(IconComponent)).toExist();
  });
});
