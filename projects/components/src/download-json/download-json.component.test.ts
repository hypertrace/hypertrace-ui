import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DownloadJsonComponent } from './download-json.component';
import { DownloadJsonModule } from './download-json.module';

describe('Button Component', () => {
  let spectator: Spectator<DownloadJsonComponent>;

  const createHost = createHostFactory({
    component: DownloadJsonComponent,
    imports: [DownloadJsonModule, RouterTestingModule],
    declarations: [MockComponent(ButtonComponent), MockComponent(IconComponent)],
    shallow: true
  });

  const dataSource$: Observable<unknown> = of('{}');

  test('should have only download button, when data is not loading', () => {
    spectator = createHost(`<ht-download-json [dataSource]="dataSource"></ht-download-json>`, {
      hostProps: {
        dataSource: dataSource$
      }
    });

    expect(spectator.query(ButtonComponent)).toExist();
  });
});
