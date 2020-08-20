import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { CardContainerComponent } from './container/card-container.component';

@Component({
  selector: 'ht-card-list',
  template: `
    <div class="ht-card-list">
      <div
        class="content"
        [ngClass]="this.getCardStyle(card)"
        *ngFor="let card of this.cards"
        (click)="this.onCardClicked(card)"
      >
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

  public selectedCard?: CardContainerComponent;

  public onCardClicked(card: CardContainerComponent): void {
    this.selectedCard = this.selectedCard === card ? undefined : card;
  }

  public getCardStyle(card: CardContainerComponent): string[] {
    const classes: string[] = [this.mode ?? CardListMode.List];

    if (this.selectedCard === card) {
      classes.push('selected-card');
    }

    return classes;
  }
}

export const enum CardListMode {
  // The strings represent css classes
  Card = 'card',
  List = 'list'
}
