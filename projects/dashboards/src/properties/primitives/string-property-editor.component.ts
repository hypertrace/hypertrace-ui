import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { EditorApi, ModelPropertyEditor, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EDITOR_API } from '@hypertrace/hyperdash-angular';

@ModelPropertyEditor({
  propertyType: STRING_PROPERTY.type
})
@Component({
  selector: 'htc-string-property-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-label [label]="label"> </htc-label>
    <htc-input [(value)]="currentValue" placeholder="" (keyup.enter)="propagateChange()" (focusout)="propagateChange()">
    </htc-input>
  `
})
export class StringPropertyEditorComponent {
  public currentValue: string;
  public readonly label: string;
  private lastPropagatedValue: string;

  public constructor(@Inject(EDITOR_API) private readonly api: EditorApi<string>) {
    this.currentValue = api.value;
    this.lastPropagatedValue = this.currentValue;
    this.label = api.label;
  }

  public propagateChange(): void {
    if (this.lastPropagatedValue !== this.currentValue) {
      this.api.valueChange(this.currentValue);
      this.lastPropagatedValue = this.currentValue;
    }
  }
}
