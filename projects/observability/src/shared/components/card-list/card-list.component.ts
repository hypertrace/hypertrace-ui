import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { CardContainerComponent } from './container/card-container.component';

@Component({
  selector: 'ht-card-list',
  template: `
    <div class="ht-card-list">
      <div class="content" [ngClass]="this.mode" *ngFor="let card of this.cards">
        <ng-container *ngTemplateOutlet="card.content"></ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent {
  @ContentChildren(CardContainerComponent)
  public readonly cards!: QueryList<CardContainerComponent>;

  @Input()
  public mode?: CardListMode = CardListMode.List;
}

export const enum CardListMode {
  // The strings represent css classes
  Card = 'card',
  List = 'list'
}
