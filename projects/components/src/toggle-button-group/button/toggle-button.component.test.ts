import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { IconModule } from '../../icon/icon.module';
import { LabelModule } from '../../label/label.module';
import { ToggleViewMode } from '../toggle-button';
import { ToggleButtonComponent } from './toggle-button.component';

describe('Toggle Button Component', () => {
  let spectator: Spectator<ToggleButtonComponent>;

  const createHost = createHostFactory({
    declareComponent: true,
    imports: [IconModule, LabelModule, RouterTestingModule],
    component: ToggleButtonComponent,
    providers: []
  });

  test('should show a label button', () => {
    spectator = createHost('<htc-toggle-button [label]="label"> </htc-toggle-button>', {
      hostProps: {
        label: 'Parsed'
      }
    });

    const buttonElement = spectator.query<HTMLElement>('.htc-toggle-button > .button');
    expect(buttonElement).toExist();
    expect(buttonElement).toHaveText('Parsed');
  });

  test('should set correct styles with set state mode', () => {
    spectator = createHost('<htc-toggle-button [label]="label"> </htc-toggle-button>', {
      hostProps: {
        label: 'Parsed'
      }
    });

    spectator.component.setState({
      isFirst: true,
      isLast: false,
      isDisabled: false,
      selectedLabel: 'Parsed',
      viewMode: ToggleViewMode.Button
    });

    expect(spectator.query('.first')).toExist();
    expect(spectator.query('.last')).not.toExist();
    expect(spectator.query('.selected')).toExist();
    expect(spectator.query('.disabled')).not.toExist();
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-view-mode'));

    // Set to last element
    spectator.component.setState({
      isFirst: false,
      isLast: true,
      isDisabled: false,
      selectedLabel: 'Parsed',
      viewMode: ToggleViewMode.Button
    });

    expect(spectator.query('.first')).not.toExist();
    expect(spectator.query('.last')).toExist();
    expect(spectator.query('.selected')).toExist();
    expect(spectator.query('.disabled')).not.toExist();
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-view-mode'));

    // Selected Label doesn't match
    spectator.component.setState({
      isFirst: false,
      isLast: true,
      isDisabled: false,
      selectedLabel: 'Raw',
      viewMode: ToggleViewMode.Button
    });

    expect(spectator.query('.first')).not.toExist();
    expect(spectator.query('.last')).toExist();
    expect(spectator.query('.selected')).not.toExist();
    expect(spectator.query('.disabled')).not.toExist();
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-view-mode'));

    // Selected Label doesn't match
    spectator.component.setState({
      isFirst: false,
      isLast: true,
      isDisabled: true,
      selectedLabel: 'Raw',
      viewMode: ToggleViewMode.Button
    });

    expect(spectator.query('.first')).not.toExist();
    expect(spectator.query('.last')).toExist();
    expect(spectator.query('.selected')).not.toExist();
    expect(spectator.query('.disabled')).toExist();

    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-view-mode'));
  });

  test('should set correct view mode styles', () => {
    spectator = createHost('<htc-toggle-button [label]="label"> </htc-toggle-button>', {
      hostProps: {
        label: 'Parsed'
      }
    });

    spectator.component.setState({
      viewMode: ToggleViewMode.Text
    });
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.text-view-mode'));

    spectator.component.setState({
      viewMode: ToggleViewMode.Button
    });
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-view-mode'));

    spectator.component.setState({
      viewMode: ToggleViewMode.ButtonGroup
    });
    expect(spectator.query('.htc-toggle-button')).toBe(spectator.query('.button-group-view-mode'));
  });

  test('should propogate click events', fakeAsync(() => {
    const labelClickedSpy = jest.fn();

    spectator = createHost(
      '<htc-toggle-button [label]="label" (labelClick)="onlabelClicked($event)"></htc-toggle-button>',
      {
        hostProps: {
          label: 'Raw',
          onlabelClicked: labelClickedSpy
        }
      }
    );

    spectator.click(spectator.query('.htc-toggle-button')!);
    tick();
    expect(labelClickedSpy).toHaveBeenCalledWith('Raw');
  }));
});
