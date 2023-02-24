import { IconType } from '@hypertrace/assets-library';
import { ButtonComponent, ExpanderToggleComponent } from '@hypertrace/components';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { PanelTitleComponent } from './panel-title.component';

describe('Panel Title Component', () => {
  const createHost = createHostFactory({
    component: PanelTitleComponent,
    shallow: true,
    declarations: [MockComponents(ExpanderToggleComponent, ButtonComponent)]
  });

  test('should render the component correctly', () => {
    const spectator = createHost(`<ht-panel-title><div>Test</div></ht-panel-title>`);
    expect(spectator.query('.ht-panel-title')).toExist();
    expect(spectator.query(ExpanderToggleComponent)).toExist();
    expect(spectator.query('.label')?.textContent).toEqual('Test');
    expect(spectator.query(ButtonComponent)).not.toExist();
  });

  test('should render the component with action icon correctly', () => {
    const spectator = createHost(`<ht-panel-title actionIcon="${IconType.Edit}"><div>Test</div></ht-panel-title>`);
    expect(spectator.query(ButtonComponent)).toExist();
    const emitSpy = spyOn(spectator.component.actionClicked, 'emit');
    spectator.click('.button');
    expect(emitSpy).toHaveBeenCalled();
  });
});
