import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, AfterContentInit } from '@angular/core';
import { queryListAndChanges$ } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CardContainerComponent } from './container/card-container.component';

@Component({
  selector: 'ht-card-list',
  template: `
    <div class="ht-card-list">
      <div
        class="content"
        [ngClass]="{
          card: this.mode === '${CardListMode.Card}',
          list: this.mode === '${CardListMode.List}',
          'selected-card': this.selectedCard === card,
          'grouped-style': card.showGroupedStyle
        }"
        *ngFor="let card of this.cards$ | async"
        (click)="this.onCardClicked(card)"
      >
        <ng-container *ngTemplateOutlet="card.content"></ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent implements AfterContentInit {
  @Input()
  public mode?: CardListMode = CardListMode.List;

  @ContentChildren(CardContainerComponent)
  private readonly cards!: QueryList<CardContainerComponent>;

  public cards$!: Observable<CardContainerComponent[]>;

  public ngAfterContentInit(): void {
    this.cards$ = queryListAndChanges$(this.cards).pipe(map(list => list.toArray()));
  }

  public selectedCard?: CardContainerComponent;

  public onCardClicked(card: CardContainerComponent): void {
    this.selectedCard = this.selectedCard === card ? undefined : card;
  }
}

export const enum CardListMode {
  // The strings represent css classes
  Card = 'card',
  List = 'list'
}
