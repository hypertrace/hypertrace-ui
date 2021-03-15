import { CommonModule } from '@angular/common';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { mockProvider } from '@ngneat/spectator';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { NEVER } from 'rxjs';
import { DividerComponent } from '../divider/divider.component';
import { LabelComponent } from '../label/label.component';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PopoverComponent } from '../popover/popover.component';
import { PopoverModule } from '../popover/popover.module';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { SelectOptionComponent } from '../select/select-option.component';
import { MultiSelectJustify } from './multi-select-justify';
import { MultiSelectComponent, TriggerLabelDisplayMode } from './multi-select.component';

describe('Multi Select Component', () => {
  const hostFactory = createHostFactory<MultiSelectComponent<string>>({
    component: MultiSelectComponent,
    imports: [LetAsyncModule, PopoverModule, CommonModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: NEVER
      })
    ],
    declarations: [
      SelectOptionComponent,
      MockComponent(LabelComponent),
      MockComponent(DividerComponent),
      MockComponent(SearchBoxComponent)
    ],
    shallow: true
  });

  let spectator: SpectatorHost<MultiSelectComponent<string>>;

  const selectionOptions = [
    { label: 'first', value: 'first-value' },
    { label: 'second', value: 'second-value' },
    { label: 'third', value: 'third-value' }
  ];

  test('should display initial selections', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" [triggerLabelDisplayMode]="triggerLabelDisplayMode" [enableSearch]="true">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
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

    expect(optionElements.length).toEqual(3);

    spectator.setHostInput({
      selected: [selectionOptions[1].value, selectionOptions[2].value]
    });

    spectator.tick();
    const selectedElements = spectator.queryAll('input:checked', { root: true });
    expect(selectedElements.length).toBe(2);
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
    expect(optionElements.length).toBe(3);

    const selectedElements = spectator.queryAll('input:checked', { root: true });
    expect(selectedElements.length).toBe(2);

    optionElements.forEach((element, index) => {
      expect(element).toHaveText(selectionOptions[index].label);
      expect(element.querySelector('ht-icon')).toExist();
    });
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

  test('should notify and update selection when all checkbox is selected', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" (selectedChange)="onChange($event)" [placeholder]="placeholder" [showAllOptionControl]="showAllOptionControl">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
          placeholder: 'Select options',
          showAllOptionControl: true,
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const allOptionElement = spectator.query('.all-options', { root: true });
    expect(allOptionElement).toExist();
    spectator.click(allOptionElement!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(selectionOptions.map(option => option.value));
    expect(spectator.query(LabelComponent)?.label).toEqual('first and 2 more');

    // De select all
    spectator.click(allOptionElement!);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(spectator.query(LabelComponent)?.label).toEqual('Select options');

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
    spectator = hostFactory(
      `
    <ht-multi-select [enableSearch]="enableSearch">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          enableSearch: true
        }
      }
    );

    spectator.click('.trigger-content');

    const searchBar = spectator.query('.search-bar', { root: true });
    expect(searchBar).toExist();

    spectator.component.searchOptions('fi');
    spectator.tick();

    let options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(1);
    expect(options[0]).toContainText('first');

    spectator.component.searchOptions('i');
    spectator.tick();

    options = spectator.queryAll('.multi-select-option', { root: true });
    expect(options.length).toBe(2);
    expect(options[0]).toContainText('first');
    expect(options[1]).toContainText('third');
    flush();
  }));
});
