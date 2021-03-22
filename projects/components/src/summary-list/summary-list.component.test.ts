import { SummaryListComponent } from '@hypertrace/components';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe('Summary List component', () => {
  let spectator: Spectator<SummaryListComponent>;

  const createComponent = createComponentFactory({
    component: SummaryListComponent,
    shallow: true,
    declarations: []
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  test('formats label', () => {
    expect(spectator.component.getFormattedLabel('TEST_UNDERSCORE')).toEqual('Test Underscore');
    expect(spectator.component.getFormattedLabel('TEST-DASH')).toEqual('Test Dash');
    expect(spectator.component.getFormattedLabel('Test_mixed-LABEL')).toEqual('Test Mixed Label');
    expect(spectator.component.getFormattedLabel('test MORE')).toEqual('Test More');
  });

  test('gets value array', () => {
    expect(spectator.component.getValuesArray(1)).toEqual([1]);
    expect(spectator.component.getValuesArray([1])).toEqual([1]);
    expect(spectator.component.getValuesArray('two')).toEqual(['two']);
    expect(spectator.component.getValuesArray(['two', 'three'])).toEqual(['two', 'three']);
    expect(spectator.component.getValuesArray(true)).toEqual([true]);
    expect(spectator.component.getValuesArray([true, false])).toEqual([true, false]);
  });
});
