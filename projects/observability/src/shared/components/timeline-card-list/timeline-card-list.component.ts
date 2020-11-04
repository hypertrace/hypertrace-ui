import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { DateFormatMode, DateFormatOptions, queryListAndChanges$ } from '@hypertrace/common';
import { ButtonRole, ButtonStyle } from '@hypertrace/components';
import { map } from 'rxjs/operators';
import { TimelineCardContainerComponent } from './container/timeline-card-container.component';

@Component({
  selector: 'ht-timeline-card-list',
  template: `
    <div class="ht-timeline-card-list">
      <ng-container *ngFor="let item of this.items">
        <ng-container *ngTemplateOutlet="timelineCard; context: { card: item.card }"></ng-container>

        <ng-container *ngIf="item.similarCards.length > 0">
          <ht-button
            *ngIf="!item.showAll; else showSimilarCards"
            label="See {{ item.similarCards.length }} more similar event{{ item.similarCards.length > 1 ? 's' : '' }} >"
            role="${ButtonRole.Primary}"
            display="${ButtonStyle.Outlined}"
            (click)="item.showAll = true"
            class="button"
            [ngClass]="{'with-margin': !this.hideTimeView}"
          ></ht-button>

          <ng-template #showSimilarCards>
            <ng-container *ngFor="let similarCard of item.similarCards">
              <ng-container *ngTemplateOutlet="timelineCard; context: { card: similarCard }"></ng-container>
            </ng-container>
          </ng-template>
        </ng-container>
      </ng-container>
    </div>

    <ng-template #timelineCard let-card="card">
      <div class="card">
        <div class="time" *ngIf="!this.hideTimeView">
          <div class="value">{{ card.timestamp | htDisplayDate: this.dateFormat }}</div>
          <div class="vertical-line"></div>
        </div>
        <div class="content" [ngClass]="{ 'selected-card': this.isSelectedCard | htMemoize: card:this.selectedIndex }">
          <ng-container *ngTemplateOutlet="card.content"></ng-container>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./timeline-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCardListComponent implements AfterContentInit {
  @Input()
  public selectedIndex?: number;

  @Input()
  public hideTimeView?: boolean = false;

  @ContentChildren(TimelineCardContainerComponent)
  public readonly cards!: QueryList<TimelineCardContainerComponent>;

  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.TimeWithSeconds
  };

  public items: TimelineListItem[] = [];
  public allCards: TimelineCardContainerComponent[] = [];

  public ngAfterContentInit(): void {
    queryListAndChanges$(this.cards)
      .pipe(map(list => list.toArray()))
      .subscribe(allCards => {
        this.allCards = allCards;
        this.buildItems(allCards);
      });
  }

  public readonly isSelectedCard = (card: TimelineCardContainerComponent, selectedIndex?: number): boolean =>
    selectedIndex !== undefined && selectedIndex >= 0 && this.allCards[selectedIndex] === card;

  private buildItems(allCards: TimelineCardContainerComponent[]): void {
    let currentItemIndex = -1;
    allCards.forEach((card, cardIndex) => {
      if (cardIndex !== 0 && card.similarToPrevious) {
        this.items[currentItemIndex].similarCards.push(card);
      } else {
        this.items.push({
          card: card,
          similarCards: []
        });
        currentItemIndex++;
      }
    });
  }
}

export interface TimelineListItem {
  card: TimelineCardContainerComponent;
  similarCards: TimelineCardContainerComponent[];
  showAll?: boolean;
}
