import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-expander-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./expander-toggle.component.scss'],
  template: `
    <div class="expander-toggle" [ngClass]="{ 'expanded-toggle': this.expanded }">
      <ht-icon
        [icon]="this.getIconType()"
        size="${IconSize.Small}"
        [showTooltip]="this.showTooltip"
        [label]="this.getTooltipText()"
      ></ht-icon>
    </div>
  `
})
export class ExpanderToggleComponent {
  public static readonly COLLAPSE: string = 'Collapse';
  public static readonly EXPAND: string = 'Expand';

  @Input()
  public expanded: boolean = false;

  @Input()
  public showTooltip: boolean = true;

  public getTooltipText(): string {
    return this.expanded ? ExpanderToggleComponent.COLLAPSE : ExpanderToggleComponent.EXPAND;
  }

  public getIconType(): IconType {
    return this.expanded ? IconType.Expanded : IconType.Collapsed;
  }
}
