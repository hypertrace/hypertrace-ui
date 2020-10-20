import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'ht-toggle-switch',
  styleUrls: ['./toggle-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-slide-toggle
      color="primary"
      [(ngModel)]="this.checked"
      [disabled]="this.disabled"
      (change)="this.onToggle($event)"
    >
      <div class="label">{{ this.label }}</div>
    </mat-slide-toggle>
  `
})
export class ToggleSwitchComponent {
  @Input()
  public checked?: boolean;

  @Input()
  public label?: string = '';

  @Input()
  public disabled: boolean | undefined;

  @Output()
  public readonly checkedChange: EventEmitter<boolean> = new EventEmitter();

  public onToggle(toggleChange: MatSlideToggleChange): void {
    this.checkedChange.emit(toggleChange.checked);
  }
}
