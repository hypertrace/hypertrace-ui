import { Renderer2 } from '@angular/core';
// import { tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator';
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
    providers: [
      mockProvider(Document),
      mockProvider(Renderer2, {
        setAttribute: jest.fn()
      })
    ],
    shallow: true
  });

  const dataSource$: Observable<unknown> = of('string');

  test('should have only download button, when data is not loading', () => {
    spectator = createHost(`<ht-download-json [dataSource]="dataSource"></ht-download-json>`, {
      hostProps: {
        dataSource: dataSource$
      }
    });

    expect(spectator.query(ButtonComponent)).toExist();
  });

  test('should download json file', () => {
    spectator = createHost(`<ht-download-json [dataSource]="dataSource" (click)="onClick()"></ht-download-json>`, {
      hostProps: {
        dataSource: dataSource$
      }
    });
    spyOn(spectator.component, 'triggerDownload');

    const spyObj = {
      click: jest.fn(),
      remove: jest.fn()
    };
    spyOn(spectator.inject(Document), 'createElement').and.returnValue(spyObj);
    spyOn(spectator.inject(Renderer2), 'setAttribute');
    expect(spectator.query('.download-button')).toExist();
    spectator.click('.download-button');
    // spectator.component.triggerDownload();
    expect(spectator.component.dataLoading).toBe(false);
    expect(spectator.component.fileName).toBe('download');
    expect(spectator.component.tooltip).toBe('Download Json');

    expect(spectator.component.triggerDownload).toHaveBeenCalledTimes(1);
    expect(spectator.inject(Document).createElement).toHaveBeenCalledTimes(1);
    expect(spectator.inject(Document).createElement).toHaveBeenCalledWith('a');
    expect(spectator.inject(Renderer2).setAttribute).toHaveBeenCalledTimes(2);

    expect(spyObj.click).toHaveBeenCalledTimes(1);
    expect(spyObj.click).toHaveBeenCalledWith();
    expect(spyObj.remove).toHaveBeenCalledTimes(1);
    expect(spyObj.remove).toHaveBeenCalledWith();
  });
});
