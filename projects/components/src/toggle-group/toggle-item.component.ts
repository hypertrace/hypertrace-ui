import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'ht-toggle-item',
  styleUrls: ['./toggle-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-item">
      <ht-label class="label" [label]="this.label"></ht-label>
    </div>
  `
})
export class ToggleItemComponent {
  @Input()
  public label?: string;

  public constructor(public readonly elementRef: ElementRef) {}
}
