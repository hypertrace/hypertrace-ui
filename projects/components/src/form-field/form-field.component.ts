import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-form-field',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="form-field" [ngClass]="{ optional: this.isOptional }">
      <div *ngIf="this.label" class="info-label">
        <ht-label class="label" [label]="this.label"></ht-label>
        <ht-label *ngIf="this.isOptional" class="optional-label" label="(Optional)"></ht-label>
        <ht-icon
          *ngIf="this.icon"
          class="infobox"
          [icon]="this.icon"
          [size]="this.iconSize"
          [htTooltip]="this.iconTooltip"
        ></ht-icon>
      </div>
      <ng-content></ng-content>
      <ht-label *ngIf="!this.isOptional || this.showError" class="error-message" [label]="this.errorLabel"></ht-label>
    </section>
  `
})
export class FormFieldComponent {
  @Input()
  public label?: string;

  @Input()
  public isOptional?: boolean = false;

  @Input()
  public icon?: string;

  @Input()
  public iconSize?: IconSize = IconSize.Small;

  @Input()
  public iconTooltip?: string;

  @Input()
  public showError?: boolean = false;

  @Input()
  public errorLabel?: string = '';
}
