import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { SelectJustify } from './select-justify';
import { SelectComponent } from './select.component';
import { SelectModule } from './select.module';

describe('Select Component', () => {
  const hostFactory = createHostFactory<SelectComponent<string>>({
    component: SelectComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY,
        navigateWithinApp: jest.fn()
      })
    ]
  });

  let spectator: SpectatorHost<SelectComponent<string>>;

  const selectionOptions = [
    { label: 'first', value: 'first-value' },
    { label: 'second', value: 'second-value' },
    { label: 'third', value: 'third-value' }
  ];

  test('should display intial selection', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-select [selected]="selected">
      <htc-select-option *ngFor="let option of options; let i = index" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value
        }
      }
    );
    spectator.tick();

    expect(spectator.element).toHaveText(selectionOptions[1].label);

    spectator.setHostInput({
      selected: selectionOptions[2].value
    });

    spectator.tick();
    expect(spectator.element).toHaveText(selectionOptions[2].label);
  }));

  test('should display provided options when clicked', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-select [selected]="selected">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value
        }
      }
    );
    spectator.tick();

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.select-option', { root: true });
    expect(spectator.query('.select-content', { root: true })).toExist();
    expect(optionElements.length).toBe(3);

    optionElements.forEach((element, index) => expect(element).toHaveText(selectionOptions[index].label));
  }));

  test('should notify and update selection when selection is changed', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <htc-select [selected]="selected" (selectedChange)="onChange($event)">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value,
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.select-option', { root: true });
    spectator.click(optionElements[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(selectionOptions[2].value);
    expect(spectator.element).toHaveText(selectionOptions[2].label);
    flush();
  }));

  test('should set correct label alignment', fakeAsync(() => {
    spectator = hostFactory(
      `
    <htc-select [selected]="selected" [showBorder]="showBorder">
      <htc-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </htc-select-option>
    </htc-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value,
          showBorder: true
        }
      }
    );
    spectator.tick();

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-left'));

    spectator.setInput({
      showBorder: false
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-right'));

    spectator.setInput({
      justify: SelectJustify.Left
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-left'));

    spectator.setInput({
      justify: SelectJustify.Right
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-right'));

    spectator.setInput({
      justify: SelectJustify.Center
    });

    expect(spectator.element).toHaveText(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toBe(spectator.query('.justify-center'));
  }));
});
