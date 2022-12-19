import { By } from '@angular/platform-browser';
import { InputComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { InputPillListComponent } from './input-pill-list.component';

describe('InputPillListComponent', () => {
  let spectator: SpectatorHost<InputPillListComponent>;
  const createHost = createHostFactory({
    component: InputPillListComponent,
    shallow: true,
    declarations: [MockComponents(InputComponent)]
  });

  const getPillValues = (spectatorInstance: SpectatorHost<InputPillListComponent>): string[] =>
    spectatorInstance.debugElement.queryAll(By.css('.secondary-input')).map(element => element.componentInstance.value);

  test('should initialize with no input, as expected', () => {
    spectator = createHost(`<ht-input-pill-list></ht-input-pill-list>`);
    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(spectator.debugElement.query(By.css('.primary-input')).componentInstance.value).toEqual('');
    expect(spectator.component.currentValues).toEqual([]);

    // Pills section
    expect(spectator.query('.pill-list')).not.toExist();
  });

  test('should initialize with input, as expected', () => {
    spectator = createHost(`<ht-input-pill-list [values]="values"></ht-input-pill-list>`, {
      hostProps: {
        values: ['test-1', 'test-2']
      }
    });
    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(spectator.debugElement.query(By.css('.primary-input')).componentInstance.value).toEqual('');

    // Pills section
    expect(spectator.query('.pill-list')).toExist();
    expect(getPillValues(spectator)).toEqual(['test-1', 'test-2']);
  });

  test('interactions should function as expected', () => {
    spectator = createHost(`<ht-input-pill-list [values]="values"></ht-input-pill-list>`, {
      hostProps: {
        values: ['test-1', 'test-2']
      }
    });

    const valueChangeEmitterSpy = spyOn(spectator.component.valueChange, 'next');

    // Header section
    expect(spectator.query('.header')).toExist();
    expect(spectator.query('.primary-input')).toExist();
    expect(spectator.debugElement.query(By.css('.primary-input')).componentInstance.value).toEqual('');

    // Modify input. Verify no emits. Verify no change for pill list.
    spectator.triggerEventHandler('.primary-input', 'valueChange', 'input-from-buffer');
    expect(getPillValues(spectator)).toEqual(['test-1', 'test-2']);
    expect(valueChangeEmitterSpy).not.toHaveBeenCalled();
    expect(valueChangeEmitterSpy).not.toHaveBeenCalledTimes(0);

    // Keydown on enter. Verify emits. Verify pill list.
    spectator.triggerEventHandler('.primary-input', 'keydown.enter', undefined);
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledWith(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).not.toHaveBeenCalledTimes(1);

    // Ignore a duplicate value
    spectator.triggerEventHandler('.primary-input', 'valueChange', 'test-2');
    spectator.triggerEventHandler('.primary-input', 'keydown.enter', undefined);
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'test-1', 'test-2']);
    expect(valueChangeEmitterSpy).not.toHaveBeenCalledTimes(1);

    // Update a pill in place. Verify emit and pill list on valueChange.
    const secondPill = spectator.debugElement.queryAll(By.css('.secondary-input'))[1];
    spectator.triggerEventHandler(secondPill, 'valueChange', 'i-am-test-2-now');
    expect(getPillValues(spectator)).toEqual(['input-from-buffer', 'i-am-test-2-now', 'test-2']);
    expect(valueChangeEmitterSpy).toHaveBeenCalledWith(['input-from-buffer', 'i-am-test-2-now', 'test-2']);
    expect(valueChangeEmitterSpy).not.toHaveBeenCalledTimes(2);
  });
});
