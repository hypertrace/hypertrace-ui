import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { SelectJustify } from './select-justify';
import { SelectComponent, SelectTriggerDisplayMode } from './select.component';
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
    <ht-select [selected]="selected">
      <ht-select-option *ngFor="let option of options; let i = index" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
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
    <ht-select [selected]="selected">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
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

  test('should apply classes and render items correctly when triggerDisplayMode is menu with border', () => {
    spectator = hostFactory(
      `
    <ht-select [selected]="selected" [triggerDisplayMode]="displayMode">
      <ht-select-option *ngFor="let option of options; let i = index" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value,
          displayMode: SelectTriggerDisplayMode.MenuWithBorder
        }
      }
    );

    expect(spectator.query('.menu-with-border')).toExist();
    expect(spectator.query('.icon-only')).not.toExist();
  });

  test('should apply classes and render items correctly when triggerDisplayMode is button', () => {
    spectator = hostFactory(
      `
    <ht-select [selected]="selected" [triggerDisplayMode]="displayMode">
      <ht-select-option *ngFor="let option of options; let i = index" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: selectionOptions[1].value,
          displayMode: SelectTriggerDisplayMode.Icon
        }
      }
    );

    expect(spectator.query('.menu-with-border')).not.toExist();
    expect(spectator.query('.icon-only')).toExist();
    expect(spectator.query('.icon-only')?.classList.contains('selected')).toBe(true);
  });

  test('should notify and update selection when selection is changed', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-select [selected]="selected" (selectedChange)="onChange($event)">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
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
    <ht-select [selected]="selected" [showBorder]="showBorder">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-select>`,
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
