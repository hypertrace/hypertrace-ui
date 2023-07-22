import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-toggle-item',
  styleUrls: ['./toggle-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-item">
      <ht-icon *ngIf="this.icon; else labelBlock" class="icon" [icon]="this.icon" size="${IconSize.Medium}"></ht-icon>
      <ng-template #labelBlock>
        <ht-label class="label" [label]="this.label"></ht-label>
      </ng-template>
    </div>
  `
})
export class ToggleItemComponent {
  @Input()
  public label?: string;

  @Input()
  public icon?: IconType;

  public constructor(public readonly elementRef: ElementRef) {}
}
