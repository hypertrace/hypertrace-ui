import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'ht-checkbox',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-checkbox
      labelPosition="after"
      [checked]="this.checked"
      [disabled]="this.disabled"
      (change)="onCheckboxChange($event)"
      class="ht-checkbox"
    >
      <ht-label class="label" *ngIf="this.label !== undefined && this.label !== ''" [label]="this.label"></ht-label>
    </mat-checkbox>
  `
})
export class CheckboxComponent {
  @Input()
  public label?: string;

  @Input()
  public checked: boolean | undefined;

  @Input()
  public disabled: boolean | undefined;

  @Output()
  public readonly checkedChange: EventEmitter<boolean> = new EventEmitter();

  public onCheckboxChange(event: MatCheckboxChange): void {
    this.checked = event.checked;
    this.checkedChange.emit(this.checked);
  }
}
