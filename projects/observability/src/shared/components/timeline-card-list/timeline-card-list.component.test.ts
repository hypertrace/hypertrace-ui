import { DateFormatMode, DateFormatter } from '@hypertrace/common';
import { PopoverService } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { TimelineCardListComponent } from './timeline-card-list.component';
import { TimelineCardListModule } from './timeline-card-list.module';

describe('Timeline Card List component', () => {
  let spectator: SpectatorHost<TimelineCardListComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: TimelineCardListComponent,
    imports: [TimelineCardListModule],
    providers: [mockProvider(PopoverService)]
  });

  test('should display all cards', () => {
    const data = [
      {
        name: 'First',
        timestamp: 1579817561559
      },
      {
        name: 'Second',
        timestamp: 1579813972292
      },
      {
        name: 'Third',
        timestamp: 1579810387143
      }
    ];

    spectator = createHost(
      `
    <ht-timeline-card-list>
      <ht-timeline-card-container *ngFor="let cardData of this.data" [timestamp]="cardData.timestamp">
        <div class="custom-card">
          <div class="title">{{cardData.name}}</div>
        </div>
      </ht-timeline-card-container>
    </ht-timeline-card-list>
    `,
      {
        hostProps: {
          data: data
        }
      }
    );

    // Add test logic
    const cardElements = spectator.queryAll('.card');

    expect(cardElements).toExist();
    expect(cardElements.length).toEqual(3);

    const dateFormatter = new DateFormatter({ mode: DateFormatMode.TimeWithSeconds });

    cardElements.forEach((cardElement, index) => {
      const timeElement = cardElement.querySelector('.value');
      expect(timeElement).toHaveText(dateFormatter.format(data[index].timestamp));

      const titleElement = cardElement.querySelector('.title');
      expect(titleElement).toExist();
      expect(titleElement).toHaveText(data[index].name);
    });

    expect(spectator.query('.selected-card')).not.toExist();

    spectator.setInput({
      selectedIndex: 0
    });

    const selectedCardContent = spectator.query('.selected-card');
    const cardContents = spectator.queryAll('.card > .content');
    expect(cardContents.length).toEqual(3);
    expect(selectedCardContent).toBe(cardContents[0]);
    expect(selectedCardContent).not.toBe(cardContents[1]);
    expect(selectedCardContent).not.toBe(cardContents[2]);
  });

  test('should display cards with groups and expansion button', () => {
    const data = [
      {
        name: 'First',
        timestamp: 1579817561559,
        isSimilarToPrevious: false
      },
      {
        name: 'Second',
        timestamp: 1579813972292,
        isSimilarToPrevious: true
      },
      {
        name: 'Third',
        timestamp: 1579810387143,
        isSimilarToPrevious: true
      }
    ];

    spectator = createHost(
      `
    <ht-timeline-card-list>
      <ht-timeline-card-container *ngFor="let cardData of this.data" [timestamp]="cardData.timestamp" [similarToPrevious]="cardData.isSimilarToPrevious">
        <div class="custom-card">
          <div class="title">{{cardData.name}}</div>
        </div>
      </ht-timeline-card-container>
    </ht-timeline-card-list>
    `,
      {
        hostProps: {
          data: data
        }
      }
    );

    // Only one card element should be visible. Other two should be gropued and hidden
    expect(spectator.queryAll('.card').length).toEqual(1);
    expect(spectator.query('.button')).toHaveText('See 2 more similar events >');

    // Click on this button should expand the list and show all cards
    spectator.click(spectator.query('.button')!);

    expect(spectator.queryAll('.card').length).toEqual(3);
    expect(spectator.query('.button')).not.toExist();
  });

  test('should display cards with time', () => {
    const data = [
      {
        name: 'First',
        timestamp: 1579817561559,
        isSimilarToPrevious: false
      },
      {
        name: 'Second',
        timestamp: 1579813972292,
        isSimilarToPrevious: true
      }
    ];

    spectator = createHost(
      `
    <ht-timeline-card-list [showTime]="showTime">
      <ht-timeline-card-container *ngFor="let cardData of this.data" [timestamp]="cardData.timestamp" [similarToPrevious]="cardData.isSimilarToPrevious">
        <div class="custom-card">
          <div class="title">{{cardData.name}}</div>
        </div>
      </ht-timeline-card-container>
    </ht-timeline-card-list>
    `,
      {
        hostProps: {
          data: data,
          showTime: true
        }
      }
    );

    // Only one card element should be visible. Other two should be gropued and hidden
    expect(spectator.queryAll('.card').length).toEqual(1);
    expect(spectator.query('.time')).toExist();
    expect(spectator.query('.button')).toBe(spectator.query('.with-margin'));

    spectator.setHostInput({
      showTime: false
    });

    expect(spectator.query('.time')).not.toExist();
    expect(spectator.query('.button')).toBe(spectator.query('.with-margin'));
  });
});
