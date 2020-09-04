import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { ComboBoxOption } from './combo-box-api';
import { ComboBoxComponent } from './combo-box.component';
import { ComboBoxModule } from './combo-box.module';

describe('Combo Box component', () => {
  const createHost = createHostFactory<ComboBoxComponent>({
    declareComponent: false,
    component: ComboBoxComponent,
    imports: [ComboBoxModule, HttpClientTestingModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn()
      })
    ]
  });

  let spectator: SpectatorHost<ComboBoxComponent>;

  const comboBoxOptions: ComboBoxOption[] = [
    { text: 'first-text', value: 'first-value' },
    { text: 'second-text', value: 'second-value' },
    { text: 'third-text', value: 'third-value' }
  ];

  beforeEach(fakeAsync(() => {
    spectator = createHost(`<htc-combo-box [options]="options" [text]="text"></htc-combo-box>`, {
      hostProps: {
        options: comboBoxOptions,
        text: 'test-text'
      }
    });
    spectator.tick();
  }));

  test('should display and not notify for initial value', () => {
    spyOn(spectator.component.textChange, 'emit');
    const element = spectator.query('.trigger-input');

    expect(element).toHaveValue('test-text');
    expect(spectator.component.textChange.emit).not.toHaveBeenCalled();
  });

  test('should clear input and notify', fakeAsync(() => {
    spyOn(spectator.component.clear, 'emit');
    const element = spectator.query('.trigger-input');
    expect(element).toHaveValue('test-text');

    spectator.click('.trigger-clear-button');
    spectator.tick();

    expect(element).toHaveValue('');
    expect(spectator.component.clear.emit).toHaveBeenCalled();

    flush();
  }));

  test('should escape from popover and notify on second escape', fakeAsync(() => {
    spyOn(spectator.component.escape, 'emit');
    const trigger = spectator.query('.trigger-input');
    expect(trigger).toHaveValue('test-text');

    spectator.click('.popover-trigger');
    spectator.tick();

    trigger!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spectator.component.escape.emit).not.toHaveBeenCalled();

    trigger!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spectator.component.escape.emit).toHaveBeenCalled();

    flush();
  }));

  test('should autocomplete value', fakeAsync(() => {
    spyOn(spectator.component.textChange, 'emit');
    spectator.click('.popover-trigger');
    spectator.tick();

    const element = spectator.query('.trigger-input');
    spectator.typeInElement('th', element!);
    element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    spectator.tick();

    expect(spectator.component.text).toEqual('third-text');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('third-text');

    flush();
  }));

  test('should display and notify for tabbed to value', fakeAsync(() => {
    spyOn(spectator.component.textChange, 'emit');
    spyOn(spectator.component.enter, 'emit');
    spectator.click('.popover-trigger');
    spectator.tick();

    const element = spectator.query('.trigger-input');
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    element!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    spectator.tick();

    expect(spectator.component.text).toEqual('second-text');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('second-text');
    expect(spectator.component.enter.emit).toHaveBeenCalledWith({
      text: 'second-text',
      option: { text: 'second-text', value: 'second-value' }
    });

    flush();
  }));

  test('should display and notify for clicked value', fakeAsync(() => {
    spyOn(spectator.component.textChange, 'emit');
    spyOn(spectator.component.selection, 'emit');
    spectator.click('.popover-trigger');
    spectator.tick();

    const elements = spectator.queryAll('.popover-item', { root: true });
    spectator.click(elements[2]);
    spectator.tick();

    expect(spectator.component.text).toEqual('third-text');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('third-text');
    expect(spectator.component.selection.emit).toHaveBeenCalledWith({
      text: 'third-text',
      option: { text: 'third-text', value: 'third-value' }
    });

    flush();
  }));
});
