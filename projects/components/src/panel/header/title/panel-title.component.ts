import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ht-panel-title',
  styleUrls: ['./panel-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-panel-title">
      <ht-expander-toggle [expanded]="this.expanded" class="expander"></ht-expander-toggle>
      <div class="label"><ng-content></ng-content></div>
    </div>
  `
})
export class PanelTitleComponent {
  @Input()
  public expanded!: boolean;
}
