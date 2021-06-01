import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-form-field',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="form-field" [ngClass]="{ optional: this.optional }">
      <div class="info-label">
        <ht-label *ngIf="this.infoLabel" class="label" [label]="this.infoLabel"></ht-label>
        <ht-label *ngIf="this.optional" class="optional-label" label="(Optional)"></ht-label>
        <ht-icon
          *ngIf="this.icon"
          class="infobox"
          [icon]="this.icon"
          [size]="this.iconSize"
          [htTooltip]="this.infoIconTooltip"
        ></ht-icon>
      </div>
      <ng-content></ng-content>
      <ht-label *ngIf="!this.optional" class="error-message" [label]="this.errorLabel"></ht-label>
    </section>
  `
})
export class FormFieldComponent {
  @Input()
  public infoLabel?: string;

  @Input()
  public optional?: boolean = false;

  @Input()
  public icon?: IconType;

  @Input()
  public iconSize?: IconSize = IconSize.Small;

  @Input()
  public infoIconTooltip?: string;

  @Input()
  public errorLabel?: string = '';
}
