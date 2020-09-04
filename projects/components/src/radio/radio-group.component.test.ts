import { async, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { RadioGroupComponent } from './radio-group.component';
import { RadioOption } from './radio-option';
import { TraceRadioModule } from './radio.module';

describe('Radio component', () => {
  let spectator: Spectator<RadioGroupComponent>;
  let logSpy: jasmine.Spy;

  const createHost = createHostFactory({
    component: RadioGroupComponent,
    imports: [TraceRadioModule, RouterTestingModule],
    declareComponent: false
  });

  beforeEach(async(() => {
    logSpy = spyOn(console, 'warn');
  }));

  test('should warn when title is not provided', () => {
    spectator = createHost(`<htc-radio-group></htc-radio-group>`);
    expect(logSpy).toHaveBeenCalled();
  });

  test('should not warn when title is provided', () => {
    spectator = createHost(`<htc-radio-group [title]="title"></htc-radio-group>`, {
      hostProps: {
        title: 'TEST'
      }
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('should apply disabled attribute when disabled', () => {
    spectator = createHost(`<htc-radio-group [title]="title" [disabled]="disabled"></htc-radio-group>`, {
      hostProps: {
        title: 'TEST',
        disabled: true
      }
    });

    const disabled: string | null = spectator.query('mat-radio-group')!.getAttribute('ng-reflect-disabled');

    expect(disabled).toBe('true');
  });

  test('should have an option for each radio value provided', () => {
    spectator = createHost(
      `<htc-radio-group [title]="title" [disabled]="disabled" [options]="options"></htc-radio-group>`,
      {
        hostProps: {
          title: 'TEST',
          disabled: false,
          options: [
            {
              label: 'TEST1',
              value: 'test1'
            },
            {
              label: 'TEST2',
              value: 'test2'
            }
          ]
        }
      }
    );

    const selected = spectator.queryAll('mat-radio-button');

    expect(selected.length).toBe(2);
  });

  test('should callback and change checked value when clicked', fakeAsync(() => {
    spectator = createHost(
      `<htc-radio-group [title]="title" [disabled]="disabled" [options]="options"></htc-radio-group>`,
      {
        hostProps: {
          title: 'TEST',
          disabled: false,
          selected: {
            label: 'TEST2',
            value: 'test2'
          },
          options: [
            {
              label: 'TEST1',
              value: 'test1'
            },
            {
              label: 'TEST2',
              value: 'test2'
            }
          ]
        }
      }
    );

    const expected: RadioOption = {
      label: 'TEST1',
      value: 'test1'
    };

    spectator.click(spectator.query('input')!);

    spectator.tick();

    expect(spectator.component.selected).toBeDefined();
    expect(spectator.component.selected!.value).toBe(expected.value);
  }));
});
