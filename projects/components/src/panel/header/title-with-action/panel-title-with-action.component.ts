import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonRole, ButtonStyle } from '../../../button/button';

@Component({
  selector: 'ht-panel-title-with-action',
  styleUrls: ['./panel-title-with-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-panel-title-with-action">
      <ht-expander-toggle [expanded]="this.expanded" class="expander"></ht-expander-toggle>
      <div class="label">
        <ng-content></ng-content>
      </div>
      <div class="action">
        <ht-event-blocker event="click">
          <ht-button
            class="button"
            [icon]="this.actionIcon"
            role="${ButtonRole.Tertiary}"
            display="${ButtonStyle.Outlined}"
            (click)="this.actionClicked.emit()"
          ></ht-button>
        </ht-event-blocker>
      </div>
    </div>
  `
})
export class PanelTitleWithActionComponent {
  @Input()
  public expanded!: boolean;

  @Input()
  public actionIcon: IconType = IconType.Edit;

  @Output()
  public readonly actionClicked: EventEmitter<void> = new EventEmitter();
}
