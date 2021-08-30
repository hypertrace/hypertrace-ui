import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { Observable, of } from 'rxjs';
import { MarkerTooltipComponent, MarkerTooltipData } from './marker-tooltip.component';
import { MarkerTooltipModule } from './marker-tooltip.module';

describe('Marker Tooltip Component', () => {
  let spectator: Spectator<MarkerTooltipComponent>;

  const createHost = createHostFactory({
    component: MarkerTooltipComponent,
    imports: [MarkerTooltipModule, RouterTestingModule],
    shallow: true
  });

  test('should have single time with summary', () => {
    const data: Observable<MarkerTooltipData> = of({
      relativeTimes: [2],
      summary: 'test-summary'
    });
    spectator = createHost(`<ht-marker-tooltip [data]="data"></ht-marker-tooltip>`, {
      hostProps: {
        data: data
      }
    });

    expect(spectator.query('.marker-tooltip-container')).toExist();
    expect(spectator.query('.count')).toHaveText('1');
    expect(spectator.query('.time-range')).toHaveText('2ms');
    expect(spectator.query('.divider')).toExist();
    expect(spectator.query('.summary')).toHaveText('test-summary');
    expect(spectator.query('.view-all')).toExist();
  });

  test('should have time range', () => {
    const data: Observable<MarkerTooltipData> = of({
      relativeTimes: [2, 3],
      summary: 'test-summary'
    });
    spectator = createHost(`<ht-marker-tooltip [data]="data" (viewAll)="viewAll"></ht-marker-tooltip>`, {
      hostProps: {
        data: data,
        viewAll: {
          emit: jest.fn()
        }
      }
    });

    expect(spectator.query('.time-range')).toHaveText('2ms - 3ms');
    const viewAllTextElement = spectator.query('.view-all-text');
    expect(viewAllTextElement).toExist();
    spectator.click(viewAllTextElement!);
  });
});
