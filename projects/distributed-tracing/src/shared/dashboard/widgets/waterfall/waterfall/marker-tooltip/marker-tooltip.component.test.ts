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

  test('should have log attributes without view all', () => {
    const data: Observable<MarkerTooltipData> = of({
      relativeTimes: [2],
      attributes: [
        ['id', 'test-id'],
        ['error', 'test-error']
      ]
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
    expect(spectator.queryAll('.key')[0]).toHaveText('id');
    expect(spectator.queryAll('.key')[1]).toHaveText('error');
    expect(spectator.queryAll('.value')[0]).toHaveText('test-id');
    expect(spectator.queryAll('.value')[1]).toHaveText('test-error');
    expect(spectator.query('.view-all')).not.toExist();
  });

  test('should have view all', () => {
    const data: Observable<MarkerTooltipData> = of({
      relativeTimes: [2, 3],
      attributes: [
        ['id', 'test-id'],
        ['error', 'test-error'],
        ['name', 'test-name'],
        ['class', 'test-class'],
        ['reason', 'test-reason'],
        ['summary', 'test-summary']
      ]
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
    expect(spectator.query('.view-all')).toExist();
    const viewAllTextElement = spectator.query('.view-all-text');
    expect(viewAllTextElement).toExist();
    spectator.click(viewAllTextElement!);
  });
});
