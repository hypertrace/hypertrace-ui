import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
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
      <div
        class="content"
        [ngClass]="{
          'show-border': this.showBorder,
          'error-border': this.showBorder && this.showFormError && this.errorLabel
        }"
      >
        <ng-content></ng-content>
      </div>
      <!-- For Backward Compatibility: Start -->
      <ht-label
        *ngIf="!this.isOptional && this.showFormError === undefined"
        class="error-message"
        [label]="this.errorLabel"
      ></ht-label>
      <!-- For Backward Compatibility: End -->

      <div class="error" *ngIf="this.showFormError && this.errorLabel">
        <ht-icon icon="${IconType.Error}" size="${IconSize.Small}"></ht-icon>
        <ht-label class="error-label" [label]="this.errorLabel"></ht-label>
      </div>
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
  public errorLabel?: string = '';

  @Input()
  public showBorder: boolean = false;

  @Input()
  public showFormError?: boolean = true;
}
