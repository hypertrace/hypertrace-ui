import { fakeAsync, flush } from '@angular/core/testing';
import { IconType } from '@hypertrace/assets-library';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { LabelComponent } from '../label/label.component';
import { LetAsyncModule } from '../let-async/let-async.module';
import { SelectJustify } from '../select/select-justify';
import { SelectOptionComponent } from '../select/select-option.component';
import { MultiSelectComponent } from './multi-select.component';

describe('Multi Select Component', () => {
  const hostFactory = createHostFactory<MultiSelectComponent<string>>({
    component: MultiSelectComponent,
    imports: [LetAsyncModule],
    entryComponents: [SelectOptionComponent],
    declarations: [MockComponent(LabelComponent)],
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
    <ht-multi-select [selected]="selected">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value]
        }
      }
    );
    spectator.tick();

    spectator.click('.trigger-content');
    expect(spectator.element).toHaveText(selectionOptions[1].label);

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
    const optionElements = spectator.queryAll('.multi-select-option', { root: true });
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

    const optionElements = spectator.queryAll('.multi-select-option', { root: true });
    spectator.click(optionElements[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([selectionOptions[1].value, selectionOptions[2].value]);
    expect(spectator.query(LabelComponent)?.label).toEqual('second and 1 more');
    flush();
  }));

  test('should set correct label alignment', fakeAsync(() => {
    spectator = hostFactory(
      `
    <ht-multi-select [selected]="selected" [showBorder]="showBorder">
      <ht-select-option *ngFor="let option of options" [label]="option.label" [value]="option.value">
      </ht-select-option>
    </ht-multi-select>`,
      {
        hostProps: {
          options: selectionOptions,
          selected: [selectionOptions[1].value],
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
