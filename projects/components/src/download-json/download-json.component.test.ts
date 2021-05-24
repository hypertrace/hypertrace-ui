import { Renderer2 } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { DownloadJsonComponent } from './download-json.component';
import { DownloadJsonModule } from './download-json.module';

describe('Download Component', () => {
  let spectator: Spectator<DownloadJsonComponent>;
  const mockElement = document.createElement('a');
  const createElementSpy = jest.fn().mockReturnValue(mockElement);

  const createHost = createHostFactory({
    component: DownloadJsonComponent,
    imports: [DownloadJsonModule, RouterTestingModule],
    declarations: [MockComponent(ButtonComponent), MockComponent(IconComponent)],
    providers: [
      mockProvider(Document, {
        createElement: createElementSpy
      }),
      mockProvider(Renderer2, {
        setAttribute: jest.fn()
      })
    ],
    shallow: true
  });

  const dataSource$: Observable<unknown> = of({
    spans: []
  });

  test('should have only download button, when data is not loading', () => {
    spectator = createHost(`<ht-download-json [dataSource]="dataSource"></ht-download-json>`, {
      hostProps: {
        dataSource: dataSource$
      }
    });

    expect(spectator.query(ButtonComponent)).toExist();
  });

  test('should download json file', fakeAsync(() => {
    spectator = createHost(`<ht-download-json [dataSource]="dataSource"></ht-download-json>`, {
      hostProps: {
        dataSource: dataSource$
      }
    });

    spyOn(spectator.component, 'triggerDownload');

    expect(spectator.component.dataLoading).toBe(false);
    expect(spectator.component.fileName).toBe('download');
    const element = spectator.query('.download-json');
    expect(element).toExist();

    spectator.click(element!);
    spectator.tick();

    expect(spectator.component.triggerDownload).toHaveBeenCalledTimes(1);
  }));
});
