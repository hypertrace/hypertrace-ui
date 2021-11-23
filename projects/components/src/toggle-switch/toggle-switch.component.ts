import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ToggleSwitchSize } from './toggle-switch-size';

@Component({
  selector: 'ht-toggle-switch',
  styleUrls: ['./toggle-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-slide-toggle
      color="primary"
      [checked]="this.checked"
      [ngClass]="{ 'small-slide-toggle': this.size === '${ToggleSwitchSize.Small}', disabled: this.disabled }"
      [disabled]="this.disabled"
      (change)="this.onToggle($event)"
    >
      <div class="label">{{ this.label }}</div>
    </mat-slide-toggle>
  `
})
export class ToggleSwitchComponent implements OnChanges {
  ngOnChanges(_changes: SimpleChanges): void {
    console.log('Method not implemented.');
  }
  @Input()
  public checked?: boolean;

  @Input()
  public label?: string = '';

  @Input()
  public disabled?: boolean;

  @Input()
  public size: ToggleSwitchSize = ToggleSwitchSize.Small;

  @Output()
  public readonly checkedChange: EventEmitter<boolean> = new EventEmitter();

  public onToggle(toggleChange: MatSlideToggleChange): void {
    this.checked = toggleChange.checked;
    this.checkedChange.emit(toggleChange.checked);
  }
}
