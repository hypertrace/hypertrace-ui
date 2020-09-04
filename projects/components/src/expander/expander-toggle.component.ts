import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'htc-expander-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./expander-toggle.component.scss'],
  template: `
    <div class="expander-toggle">
      <htc-icon
        [icon]="this.getIconType()"
        size="${IconSize.Small}"
        [showTooltip]="this.showTooltip"
        [label]="this.getTooltipText()"
      ></htc-icon>
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
