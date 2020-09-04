import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'htc-toggle-item',
  styleUrls: ['./toggle-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-item">
      <htc-label class="label" [label]="this.label"></htc-label>
    </div>
  `
})
export class ToggleItemComponent {
  @Input()
  public label?: string;

  public constructor(public readonly elementRef: ElementRef) {}
}
