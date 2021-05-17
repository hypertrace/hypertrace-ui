import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { DomElementScrollIntoViewService } from '../../../common/src/utilities/dom/dom-element-scroll-into-view.service';
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
      }),
      mockProvider(DomElementScrollIntoViewService)
    ]
  });

  const comboBoxOptions: ComboBoxOption[] = [
    { text: 'First-text', value: 'first-value' },
    { text: 'Second-Text', value: 'second-value' },
    { text: 'Third-TEXT', value: 'third-value' }
  ];

  test('should display and not notify for initial value', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text'
        }
      }
    );
    spectator.tick();

    spyOn(spectator.component.textChange, 'emit');
    const element = spectator.query('.trigger-input');

    expect(element).toHaveValue('test-text');
    expect(spectator.component.textChange.emit).not.toHaveBeenCalled();
  }));

  test('should clear input and notify', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text'
        }
      }
    );
    spectator.tick();

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
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text'
        }
      }
    );
    spectator.tick();

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

  test('should autocomplete value when provideCreateOption disabled', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text'
        }
      }
    );
    spectator.tick();

    spyOn(spectator.component.textChange, 'emit');
    spectator.click('.popover-trigger');
    spectator.tick();

    const element = spectator.query('.trigger-input');
    spectator.typeInElement('th', element!);
    element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    spectator.tick();

    expect(spectator.component.text).toEqual('Third-TEXT');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('Third-TEXT');

    flush();
  }));

  test('should create new value when provideCreateOption enabled', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text" [provideCreateOption]="provideCreateOption"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text',
          provideCreateOption: true
        }
      }
    );
    spectator.tick();

    spyOn(spectator.component.textChange, 'emit');
    spectator.click('.popover-trigger');
    spectator.tick();

    const element = spectator.query('.trigger-input');
    spectator.typeInElement('th', element!);
    element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    spectator.tick();

    expect(spectator.component.text).toEqual('th'); // Creates instead of autocompletes first match
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('th');

    flush();
  }));

  test('should display and notify for tabbed to value when wrapping list without createOption', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text" [provideCreateOption]="provideCreateOption"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text',
          provideCreateOption: false
        }
      }
    );

    spyOn(spectator.component.textChange, 'emit');
    spyOn(spectator.component.enter, 'emit');
    spectator.click('.trigger-clear-button'); // Need to clear the 'test-text' to unfilter all options
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

    expect(spectator.component.text).toEqual('Second-Text');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('Second-Text');
    expect(spectator.component.enter.emit).toHaveBeenCalledWith({
      text: 'Second-Text',
      option: { text: 'Second-Text', value: 'second-value' }
    });

    flush();
  }));

  test('should display and notify for tabbed to value when wrapping list with createOption', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text" [provideCreateOption]="provideCreateOption"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text',
          provideCreateOption: true
        }
      }
    );

    spyOn(spectator.component.textChange, 'emit');
    spyOn(spectator.component.enter, 'emit');
    spectator.click('.trigger-clear-button'); // Need to clear the 'test-text' to unfilter all options
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

    expect(spectator.component.text).toEqual('First-text');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('First-text');
    expect(spectator.component.enter.emit).toHaveBeenCalledWith({
      text: 'First-text',
      option: { text: 'First-text', value: 'first-value' }
    });

    flush();
  }));

  test('should display and notify for clicked value', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-combo-box [options]="options" [text]="text" [provideCreateOption]="provideCreateOption"></ht-combo-box>
    `,
      {
        hostProps: {
          options: comboBoxOptions,
          text: 'test-text',
          provideCreateOption: true
        }
      }
    );

    spyOn(spectator.component.textChange, 'emit');
    spyOn(spectator.component.selection, 'emit');
    spectator.click('.trigger-clear-button'); // Need to clear the 'test-text' to unfilter all options
    spectator.click('.popover-trigger');
    spectator.tick();

    const elements = spectator.queryAll('.popover-item', { root: true });
    spectator.click(elements[2]);
    spectator.tick();

    expect(spectator.component.text).toEqual('Third-TEXT');
    expect(spectator.component.textChange.emit).toHaveBeenCalledWith('Third-TEXT');
    expect(spectator.component.selection.emit).toHaveBeenCalledWith({
      text: 'Third-TEXT',
      option: { text: 'Third-TEXT', value: 'third-value' }
    });

    flush();
  }));
});
