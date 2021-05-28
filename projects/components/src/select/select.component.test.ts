import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconLibraryTestingModule, IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import { IconComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY } from 'rxjs';
import { SelectControlOptionPosition } from './select-control-option.component';
import { SelectJustify } from './select-justify';
import { SelectComponent, SelectTriggerDisplayMode } from './select.component';
import { SelectModule } from './select.module';

describe('Select Component', () => {
  const hostFactory = createHostFactory<SelectComponent<string>>({
    component: SelectComponent,
    imports: [SelectModule, HttpClientTestingModule, IconLibraryTestingModule],
    declareComponent: false,
    declarations: [MockComponent(IconComponent)],
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
    { label: 'third', value: 'third-value', selectedLabel: 'Third Value!!!', icon: 'test-icon', iconColor: 'red' }
  ];

  test('should display initial selection', fakeAsync(() => {
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
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value" [selectedLabel]="option.selectedLabel">
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
    expect(spectator.query('.trigger-content')).toHaveText(selectionOptions[1].label);
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.select-option', { root: true });
    spectator.click(optionElements[2]);

    expect(onChange).toHaveBeenCalledWith(selectionOptions[2].value);
    expect(spectator.query('.trigger-content')).toHaveText(selectionOptions[2].selectedLabel!);
    flush();
  }));

  test('should set trigger-prefix-icon correctly', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-select [icon]="icon">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value" [icon]="option.icon" [iconColor]="option.iconColor">
      </ht-select-option>
    </ht-select>`,
      {
        hostProps: {
          options: selectionOptions,
          icon: 'select-level-icon'
        }
      }
    );
    spectator.tick();

    // No selection -> select component level icon and no color
    expect(spectator.debugElement.query(By.css('.trigger-prefix-icon')).componentInstance.icon).toBe(
      'select-level-icon'
    );
    expect(spectator.debugElement.query(By.css('.trigger-prefix-icon')).componentInstance.color).toBe(null);

    // Selection with no icon -> no icon and no color
    spectator.click('.trigger-content');
    let optionElements = spectator.queryAll('.select-option', { root: true });
    spectator.click(optionElements[1]);
    spectator.tick();
    expect(spectator.query('.trigger-prefix-icon')).not.toExist();

    // Selection with icon and color
    spectator.click('.trigger-content');
    optionElements = spectator.queryAll('.select-option', { root: true });
    spectator.click(optionElements[2]);
    spectator.tick();

    expect(spectator.debugElement.query(By.css('.trigger-prefix-icon')).componentInstance.icon).toBe('test-icon');
    expect(spectator.debugElement.query(By.css('.trigger-prefix-icon')).componentInstance.color).toBe('red');

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

  test('should show control options on the top as expected', fakeAsync(() => {
    const onChange = jest.fn();

    spectator = hostFactory(
      `
    <ht-select (selectedChange)="onChange($event)">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value"></ht-select-option>
      <ht-select-control-option [label]="controlLabel" [value]="controlValue" [position]="controlPosition" [icon]="controlIcon"></ht-select-control-option>
    </ht-select>`,
      {
        hostProps: {
          options: selectionOptions,
          controlLabel: 'None',
          controlValue: 'none-id',
          controlIcon: IconType.Debug,
          controlPosition: SelectControlOptionPosition.Top,
          onChange: onChange
        }
      }
    );

    spectator.tick();
    spectator.click('.trigger-content');

    const optionElements = spectator.queryAll('.select-option', { root: true });
    expect(optionElements[0].querySelector('.icon')).toExist();
    expect(optionElements[0]).toContainText('None');
    spectator.click(optionElements[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('none-id');
    flush();
  }));
});
