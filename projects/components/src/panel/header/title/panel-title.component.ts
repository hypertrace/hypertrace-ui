import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'htc-panel-title',
  styleUrls: ['./panel-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="htc-panel-title">
      <htc-expander-toggle [expanded]="this.expanded" class="expander"></htc-expander-toggle>
      <div class="label"><ng-content></ng-content></div>
    </div>
  `
})
export class PanelTitleComponent {
  @Input()
  public expanded!: boolean;
}
