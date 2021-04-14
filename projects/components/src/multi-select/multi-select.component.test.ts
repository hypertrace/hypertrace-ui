import { CommonModule } from '@angular/common';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { NEVER } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DividerComponent } from '../divider/divider.component';
import { LabelComponent } from '../label/label.component';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { PopoverComponent } from '../popover/popover.component';
import { PopoverModule } from '../popover/popover.module';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { SelectOptionComponent } from '../select/select-option.component';
import { MultiSelectJustify } from './multi-select-justify';
import { MultiSelectComponent, MultiSelectSearchMode, TriggerLabelDisplayMode } from './multi-select.component';

describe('Multi Select Component', () => {
  const hostFactory = createHostFactory<MultiSelectComponent<string>>({
    component: MultiSelectComponent,
    imports: [PopoverModule, CommonModule, LoadAsyncModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: NEVER
      })
    ],
    declarations: [
      SelectOptionComponent,
      MockComponent(LabelComponent),
      MockComponent(DividerComponent),
      MockComponent(SearchBoxComponent),
      MockComponent(ButtonComponent),
      MockComponent(CheckboxComponent)
    ],
    shallow: true
  });

  let spectator: SpectatorHost<MultiSelectComponent<string>>;

  const selectionOptions = [
    { label: 'first', value: 'first-value' },
    { label: 'second', value: 'second-value' },
    { label: 'third', value: 'third-value' },
    { label: 'fourth', value: 'fourth-value' },
    { label: 'fifth', value: 'fifth-value' },
    { label: 'sixth', value: 'sixth-value' }
  ];

  test('should display initial selections', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" [triggerLabelDisplayMode]="triggerLabelDisplayMode" [searchMode]="searchMode">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          searchMode: MultiSelectSearchMode.CaseInsensitive,
          triggerLabelDisplayMode: TriggerLabelDisplayMode.Selection
        }
      }
    );

    spectator.tick();

    expect(spectator.component.triggerLabel).toEqual(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toExist();
    expect(spectator.query('.trigger-label-container')).toExist();
    expect(spectator.query('.trigger-label')).toExist();
    expect(spectator.query('.trigger-icon')).toExist();

    const popoverComponent = spectator.query(PopoverComponent);
    expect(popoverComponent?.closeOnClick).toEqual(false);
    expect(popoverComponent?.closeOnNavigate).toEqual(true);

    spectator.click('.trigger-content');

    expect(spectator.query('.multi-select-content', { root: true })).toExist();
    expect(spectator.query('.multi-select-content .search-bar', { root: true })).toExist();
    expect(spectator.query('.multi-select-content .multi-select-option', { root: true })).toExist();

    expect(spectator.query('.multi-select-content', { root: true })).toExist();
    const optionElements = spectator.queryAll('.multi-select-option', { root: true });

    expect(optionElements.length).toEqual(6);

    spectator.setHostInput({
      selected: [selectionOptions[1].value, selectionOptions[2].value]
    });

    spectator.tick();
    const selectedCheckboxElements = spectator.queryAll('ht-checkbox', { root: true });
    expect(
      selectedCheckboxElements.filter(checkboxElement => checkboxElement.getAttribute('ng-reflect-checked') === 'true')
        .length
    ).toBe(2);
  }));

  test('should display provided options with icons when clicked', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected">
      <ht-select-option
        *ngFor="let option of options"
        [label]="option.label"
        [value]="option.value"
        icon="${IconType.Label}"
        iconColor="#FEA395">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value, selectionOptions[2].value]
        }
      }
    );
    spectator.tick();

    spectator.click('.trigger-content');
    const optionElements = spectator.queryAll('.multi-select-option:not(.all-options)', { root: true });
    expect(spectator.query('.multi-select-content', { root: true })).toExist();
    expect(optionElements.length).toBe(6);

    const selectedCheckboxElements = spectator.queryAll('ht-checkbox', { root: true });
    expect(
      selectedCheckboxElements.filter(checkboxElement => checkboxElement.getAttribute('ng-reflect-checked') === 'true')
        .length
    ).toBe(2);

    optionElements.forEach((element, index) => {
      expect(element).toHaveText(selectionOptions[index].label);
      expect(element.querySelector('ht-icon')).toExist();
    });
  }));

  test('should block prevent default when checkbox is clicked', fakeAsync(() => {
    const onChange = jest.fn();
    spectator = hostFactory(
      `
    <ht-multi-select (selectedChange)="onChange($event)" [selected]="selected">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [],
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');
    const selectedCheckboxElement = spectator.queryAll('ht-checkbox', { root: true })[0];
    expect(spectator.dispatchFakeEvent(selectedCheckboxElement, 'click', true).defaultPrevented).toBe(true);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([selectionOptions[0].value]);
    expect(spectator.query(LabelComponent)?.label).toEqual('first');
    flush();
  }));

  test('should notify and update selection when selection is changed', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" (selectedChange)="onChange($event)">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.multi-select-option:not(.all-options)', { root: true });
    spectator.click(optionElements[2]);
    spectator.tick();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([selectionOptions[1].value, selectionOptions[2].value]);
    expect(spectator.query(LabelComponent)?.label).toEqual('second and 1 more');
    flush();
  }));

  test('should show all checkbox only when enabled by input property', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select>
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const allOptionElement = spectator.query('.all-options', { root: true });
    expect(allOptionElement).not.toExist();

    flush();
  }));

  test('should show select all and clear selected buttons', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" (selectedChange)="onChange($event)" [placeholder]="placeholder" [searchMode]="searchMode">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          placeholder: 'Select options',
          searchMode: MultiSelectSearchMode.CaseInsensitive,
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    expect(spectator.query('.search-bar', { root: true })).toExist();
    expect(spectator.query('.divider', { root: true })).toExist();

    expect(spectator.component.isAnyOptionSelected()).toEqual(true);
    const clearSelectedButton = spectator.query('.clear-selected', { root: true });
    expect(clearSelectedButton).toExist();
    spectator.click(clearSelectedButton!);

    spectator.tick();

    expect(
      spectator
        .queryAll('ht-checkbox', { root: true })
        .filter(checkboxElement => checkboxElement.getAttribute('ng-reflect-checked') === 'true').length
    ).toBe(0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(spectator.query(LabelComponent)?.label).toEqual('Select options');

    const allOptionElement = spectator.query('.select-all', { root: true });
    expect(allOptionElement).toExist();
    spectator.click(allOptionElement!);

    spectator.tick();
    const selectedCheckboxElements = spectator.queryAll('ht-checkbox', { root: true });
    expect(selectedCheckboxElements.length).toBe(6);

    expect(onChange).toHaveBeenCalledWith(selectionOptions.map(option => option.value));
    expect(spectator.query(LabelComponent)?.label).toEqual('first and 5 more');

    spectator.setHostInput({
      searchMode: MultiSelectSearchMode.Disabled
    });

    expect(spectator.query('.search-bar', { root: true })).not.toExist();
    expect(spectator.query('.divider', { root: true })).not.toExist();
    expect(spectator.query('.clear-selected', { root: true })).not.toExist();
    expect(spectator.query('.select-all', { root: true })).not.toExist();

    flush();
  }));

  test('should notify but not change trigger label if triggerLabelDisplayMode is placeholder', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" (selectedChange)="onChange($event)" placeholder="Placeholder" [triggerLabelDisplayMode]="triggerDisplayMode">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          onChange: onChange,
          triggerDisplayMode: TriggerLabelDisplayMode.Placeholder
        }
      }
    );

    spectator.tick();
    expect(spectator.query(LabelComponent)?.label).toEqual('Placeholder');
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.multi-select-option:not(.all-options)', { root: true });
    spectator.click(optionElements[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([selectionOptions[1].value, selectionOptions[2].value]);
    expect(spectator.query(LabelComponent)?.label).toEqual('Placeholder');
    flush();
  }));

  test('should set correct justification', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" [showBorder]="showBorder" [justify]="justify">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          showBorder: true,
          justify: MultiSelectJustify.Left
        }
      }
    );
    spectator.tick();

    expect(spectator.component.triggerLabel).toEqual(selectionOptions[1].label);
    expect(spectator.query('.trigger-content')).toExist();
    expect(spectator.query('.trigger-label-container')).toExist();
    expect(spectator.query('.trigger-label')).toExist();
    expect(spectator.query('.trigger-icon')).toExist();
    expect(spectator.query('.trigger-content')!.getAttribute('style')).toBe('justify-content: flex-start;');

    spectator.setInput({
      justify: MultiSelectJustify.Center
    });

    expect(spectator.query('.trigger-content')!.getAttribute('style')).toBe('justify-content: center;');

    spectator.setInput({
      justify: MultiSelectJustify.Right
    });

    expect(spectator.query('.trigger-content')!.getAttribute('style')).toBe('justify-content: flex-end;');
  }));

  test('should show searchbox if applicable and function as expected', fakeAsync(() => {
    const onSearchValueChangeSpy = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [searchMode]="searchMode" (searchValueChange)="onSearchValueChange($event)">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          searchMode: MultiSelectSearchMode.CaseInsensitive,
          onSearchValueChange: onSearchValueChangeSpy
        }
      }
    );

    spectator.click('.trigger-content');

    const searchBar = spectator.query('.search-bar', { root: true });
    expect(searchBar).toExist();

    spectator.component.searchOptions('fi');
    spectator.tick();
    expect(onSearchValueChangeSpy).toHaveBeenLastCalledWith('fi');

    let options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(2);
    expect(options[0]).toContainText('first');

    spectator.component.searchOptions('i');
    spectator.tick();
    expect(onSearchValueChangeSpy).toHaveBeenLastCalledWith('i');

    options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(4);
    expect(options[0]).toContainText('first');
    expect(options[1]).toContainText('third');

    expect(spectator.query('.divider', { root: true })).toExist();
    expect(spectator.query('.clear-selected', { root: true })).not.toExist(); // Due to initial selection
    expect(spectator.query('.select-all', { root: true })).toExist();

    // Set options list to less than 1 and search control buttons should be hidden
    spectator.setHostInput({
      options: []
    });

    expect(spectator.query('.search-bar', { root: true })).toExist();
    expect(spectator.query('.divider', { root: true })).toExist();
    expect(spectator.query('.clear-selected', { root: true })).not.toExist();
    expect(spectator.query('.select-all', { root: true })).not.toExist();
    flush();
  }));

  test('should show search box and emit only when search mode is emit only', fakeAsync(() => {
    const onSearchValueChangeSpy = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [searchMode]="searchMode" (searchValueChange)="onSearchValueChange($event)">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          searchMode: MultiSelectSearchMode.EmitOnly,
          onSearchValueChange: onSearchValueChangeSpy
        }
      }
    );

    spectator.click('.trigger-content');

    const searchBar = spectator.query('.search-bar', { root: true });
    expect(searchBar).toExist();

    spectator.component.searchOptions('fi');
    spectator.tick();
    expect(onSearchValueChangeSpy).toHaveBeenLastCalledWith('fi');

    // No change in options length since for this test, externally we did not filter any option
    let options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(6);
    spectator.component.searchOptions('i');
    spectator.tick();
    expect(onSearchValueChangeSpy).toHaveBeenLastCalledWith('i');

    options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(6);

    // Set selected options to less than 5 and search box and buttons should still be visible
    spectator.setHostInput({
      options: selectionOptions.slice(0, 3)
    });

    expect(spectator.query('.search-bar', { root: true })).toExist();
    expect(spectator.query('.divider', { root: true })).toExist();
    expect(spectator.query('.clear-selected', { root: true })).not.toExist();
    expect(spectator.query('.select-all', { root: true })).toExist();
    flush();
  }));
});
