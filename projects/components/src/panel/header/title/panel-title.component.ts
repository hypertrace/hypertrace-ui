import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonVariant, ButtonStyle } from '../../../button/button';

@Component({
  selector: 'ht-panel-title',
  styleUrls: ['./panel-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ht-panel-title">
      <section class="left-section">
        <ht-expander-toggle [expanded]="this.expanded" class="expander"></ht-expander-toggle>
        <div class="label">
          <ng-content></ng-content>
        </div>
      </section>
      <section class="right-section" *ngIf="this.actionIcon">
        <ht-event-blocker event="click">
          <ht-button
            class="button"
            [icon]="this.actionIcon"
            variant="${ButtonVariant.Tertiary}"
            display="${ButtonStyle.Outlined}"
            (click)="this.actionClicked.emit()"
          ></ht-button>
        </ht-event-blocker>
      </section>
    </section>
  `
})
export class PanelTitleComponent {
  @Input()
  public expanded!: boolean;

  @Input()
  public actionIcon?: string;

  @Output()
  public readonly actionClicked: EventEmitter<void> = new EventEmitter();
}
