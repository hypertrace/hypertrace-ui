import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { RadioOption } from '@hypertrace/components';
import { EditorApi, ModelPropertyEditor } from '@hypertrace/hyperdash';
import { EDITOR_API } from '@hypertrace/hyperdash-angular';
import { EnumPropertyTypeInstance, ENUM_TYPE } from './enum-property-type';

@ModelPropertyEditor({ propertyType: ENUM_TYPE.type })
@Component({
  selector: 'ht-enum-property-type-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-label [label]="api.label"></ht-label>
    <ht-select [selected]="api.value" (selectedChange)="api.valueChange($event)">
      <ht-select-option *ngFor="let option of options" [value]="option.value" [label]="option.label">
      </ht-select-option>
    </ht-select>
  `,
})
export class EnumPropertyTypeEditorComponent {
  public readonly options: RadioOption[];

  public constructor(@Inject(EDITOR_API) public readonly api: EditorApi<string>) {
    this.options = this.getValues();
  }

  protected getValues(): RadioOption[] {
    const propertyTypeInstance = this.api.propertyTypeInstance as EnumPropertyTypeInstance;

    return propertyTypeInstance.values.map(value => ({
      label: this.capitalizeAndSpace(value),
      value: value,
    }));
  }

  protected capitalizeAndSpace(value: string): string {
    return (
      value.charAt(0).toUpperCase() + value.replace(/-(\w)/g, capture => ` ${capture.charAt(1).toUpperCase()}`).slice(1)
    );
  }

  public valueChange(newValue: string): void {
    this.api.valueChange(newValue);
  }
}
