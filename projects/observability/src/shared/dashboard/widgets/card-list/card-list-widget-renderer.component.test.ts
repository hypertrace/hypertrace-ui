import { FormattingModule } from '@hypertrace/common';
import {
  LoadAsyncModule,
  SummaryCardColor,
  SummaryCardComponent,
  TitledContentComponent
} from '@hypertrace/components';
import { RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Entity, entityIdKey, entityTypeKey, ObservabilityEntityType } from '@hypertrace/observability';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { EMPTY, of } from 'rxjs';
import { Card, CardType } from './card';
import { CardListWidgetModel } from './card-list-widget-model';
import { CardListWidgetRendererComponent } from './card-list-widget-renderer.component';

describe('Card List Widget Renderer', () => {
  let mockModel: Partial<CardListWidgetModel<Card<Entity>[]>> = {};

  const componentFactory = createComponentFactory({
    component: CardListWidgetRendererComponent,
    imports: [FormattingModule, LoadAsyncModule],
    providers: [
      {
        provide: RENDERER_API,
        useFactory: () => ({
          getTimeRange: jest.fn(),
          model: mockModel,
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        })
      }
    ],
    declarations: [MockComponent(TitledContentComponent), MockComponent(SummaryCardComponent)],
    shallow: true
  });

  test('should render card list widget', () => {
    const card1 = {
      name: 'Card #1',
      color: SummaryCardColor.Red,
      summaries: [],
      context: {
        [entityIdKey]: 'entity-id-1',
        [entityTypeKey]: ObservabilityEntityType.Service
      }
    };

    const card2 = {
      name: 'Card #2',
      color: SummaryCardColor.Brown,
      summaries: [],
      context: {
        [entityIdKey]: 'entity-id-2',
        [entityTypeKey]: ObservabilityEntityType.Service
      }
    };

    const mockInteractionHandler = jest.fn();

    mockModel = {
      header: {
        title: 'I am Title'
      },
      cardType: CardType.Summary,
      getData: jest.fn(() => of([card1, card2])),
      clickHandler: {
        execute: mockInteractionHandler
      }
    };

    const spectator = componentFactory();

    expect(spectator.query(TitledContentComponent)!.title).toEqual('I AM TITLE');

    const cards = spectator.queryAll(SummaryCardComponent);
    expect(cards.length).toEqual(2);

    expect(cards[0].name).toEqual(card1.name);
    expect(cards[0].color).toEqual(card1.color);
    expect(cards[0].summaries).toEqual(card1.summaries);

    expect(cards[1].name).toEqual(card2.name);
    expect(cards[1].color).toEqual(card2.color);
    expect(cards[1].summaries).toEqual(card2.summaries);

    spectator.triggerEventHandler('htc-summary-card', 'click', undefined);
    expect(mockInteractionHandler).toHaveBeenCalledWith(card1.context);
  });
});
