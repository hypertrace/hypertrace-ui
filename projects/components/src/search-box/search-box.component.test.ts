import { Subject } from 'rxjs';
import { fakeAsync } from '@angular/core/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { SearchBoxComponent } from './search-box.component';
import { By } from '@angular/platform-browser';
import { runFakeRxjs } from '@hypertrace/test-utils';

describe('Search box Component', () => {
  let spectator: Spectator<SearchBoxComponent>;

  const createHost = createHostFactory({
    component: SearchBoxComponent,
    shallow: true
  });

  test('should work with default values', fakeAsync(() => {
    // const onValueChangeSpy = jest.fn();
    const valueSubject = new Subject<string>();
    spectator = createHost(
      `<ht-search-box [placeholder]="placeholder" (valueChange)="onValueChange($event)"></ht-search-box>`,
      {
        hostProps: {
          placeholder: 'Test Placeholder',
          onValueChange: (value: string) => {
            valueSubject.next(value);
          }
        }
      }
    );

    const inputDebugElement = spectator.debugElement.query(By.css('input'));
    spectator.component.value = 'Test';
    spectator.triggerEventHandler(inputDebugElement, 'input', spectator.component.value);
    spectator.tick();
    // spectator.tick();

    valueSubject.subscribe({
      next: (value: string) => {
        console.log(value);
      }
    });

    // expect(onValueChangeSpy).toHaveBeenCalledWith('Test');

    runFakeRxjs(({ expectObservable }) => {
      spectator.triggerEventHandler(inputDebugElement, 'input', spectator.component.value);
      spectator.tick();
      expectObservable(spectator.component.valueChange).toBe('(xyz)', {
        x: 'Test'
      });
    });
  }));

  // test('should pass properties to Mat Slide toggle correctly', fakeAsync(() => {
  //   const onValueChangeSpy = jest.fn();
  //   spectator = createHost(
  //     `<ht-search-box [placeholder]="placeholder" [value]="value" [debounceTime]="debounceTime" (valueChange)="onValueChange($event)"></ht-search-box>`,
  //     {
  //       hostProps: {
  //         placeholder: 'Test Placeholder',
  //         value: '',
  //         debounceTime: 10,
  //         onValueChange: onValueChangeSpy
  //       }
  //     }
  //   );
  // }));
});
