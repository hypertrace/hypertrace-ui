import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { CardListComponent, CardListMode } from './card-list.component';
import { CardListModule } from './card-list.module';

describe('Card List component', () => {
  let spectator: Spectator<CardListComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: CardListComponent,
    imports: [CardListModule],
    providers: []
  });

  test('should display all cards', () => {
    const data = [
      {
        name: 'first'
      },
      {
        name: 'second'
      },
      {
        name: 'third'
      }
    ];

    spectator = createHost(
      `
    <ht-card-list [mode]="mode">
      <ht-card-container *ngFor="let cardData of this.data">
        <div class="custom-card">
          <div class="title">{{cardData.name}}</div>
        </div>
      </ht-card-container>
    </ht-card-list>
    `,
      {
        hostProps: {
          data: data,
          mode: CardListMode.Card
        }
      }
    );

    // Add test logic
    const projectedCardElements = spectator.queryAll('.custom-card');

    expect(projectedCardElements).toExist();
    expect(projectedCardElements.length).toEqual(3);

    projectedCardElements.forEach((projectedCardElement, index) => {
      const titleElement = projectedCardElement.querySelector('.title');
      expect(titleElement).toExist();
      expect(titleElement).toHaveText(data[index].name);
    });

    // Test selection style
    const cardElements = spectator.queryAll('.card');
    spectator.click(cardElements[0]);
    expect(spectator.query('.selected-card')).toBe(cardElements[0]);
    expect(spectator.query('.selected-card')).not.toBe(cardElements[1]);
    expect(spectator.query('.selected-card')).not.toBe(cardElements[2]);
  });

  test('should apply grouped style class', () => {
    const data = [
      {
        name: 'first',
        grouped: true
      },
      {
        name: 'second',
        grouped: false
      },
      {
        name: 'third',
        grouped: false
      }
    ];

    spectator = createHost(
      `
    <ht-card-list [mode]="mode">
      <ht-card-container *ngFor="let cardData of this.data; first" showGroupedStyle="cardData.grouped">
        <div class="custom-card">
          <div class="title">{{cardData.name}}</div>
        </div>
      </ht-card-container>
    </ht-card-list>
    `,
      {
        hostProps: {
          data: data,
          mode: CardListMode.Card
        }
      }
    );

    // Test selection style
    const cardElements = spectator.queryAll('.card');
    spectator.click(cardElements[0]);
    expect(spectator.query('.grouped-style')).toBe(cardElements[0]);
    expect(spectator.query('.grouped-style')).not.toBe(cardElements[1]);
    expect(spectator.query('.grouped-style')).not.toBe(cardElements[2]);
  });
});
