import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { Observable } from 'rxjs';
import { Card, CardType } from './card';
import { CardListWidgetModel } from './card-list-widget-model';

@Renderer({ modelClass: CardListWidgetModel })
@Component({
  selector: 'ht-card-list-widget-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./card-list-widget-renderer.component.scss'],
  template: `
    <div class="card-list-widget">
      <htc-titled-content
        [title]="this.model.header?.title | htcDisplayTitle"
        [link]="this.model.header?.link?.url"
        [linkLabel]="this.model.header?.link?.displayText"
        *htcLoadAsync="this.data$ as cards"
      >
        <ht-card-list>
          <ht-card-container *ngFor="let card of cards" [ngSwitch]="this.model.cardType">
            <div class="summary-card" *ngSwitchCase="'${CardType.Summary}'">
              <htc-summary-card
                [name]="card.name"
                [color]="card.color"
                [summaries]="card.summaries"
                (click)="this.model.clickHandler?.execute(card.context)"
              ></htc-summary-card>
            </div>
          </ht-card-container>
        </ht-card-list>
      </htc-titled-content>
    </div>
  `
})
export class CardListWidgetRendererComponent<T extends Card[]> extends WidgetRenderer<CardListWidgetModel<T>, T> {
  protected fetchData(): Observable<T> {
    return this.model.getData();
  }
}
