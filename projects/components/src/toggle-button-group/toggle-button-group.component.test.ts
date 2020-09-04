import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { ToggleButtonGroupComponent } from './toggle-button-group.component';
import { ToggleButtonModule } from './toggle-button.module';

describe('Toggle Button Group Component', () => {
  let spectator: Spectator<ToggleButtonGroupComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: ToggleButtonGroupComponent,
    imports: [ToggleButtonModule, IconModule, LabelModule, RouterTestingModule],
    providers: []
  });

  test('should show two toggle buttons', fakeAsync(() => {
    const labels = ['Parsed', 'Raw'];
    spectator = createHost(
      `
      <htc-toggle-button-group>
        <htc-toggle-button *ngFor="let label of this.labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: labels
        }
      }
    );

    spectator.tick();

    const buttonElements = spectator.queryAll('.htc-toggle-button > .button');
    expect(buttonElements.length).toBe(2);

    // Match rendered label values with data
    buttonElements.forEach((buttonElement, index) => {
      expect(buttonElement).toExist();
      expect(buttonElement.textContent!.trim()).toEqual(labels[index]); // Not sure why, but toHaveText() doesn't work here
    });
  }));

  test('should not select any item if disableInitialSelection is set to true', fakeAsync(() => {
    const labels = ['Parsed', 'Raw'];
    spectator = createHost(
      `
      <htc-toggle-button-group [disableInitialSelection]="true">
        <htc-toggle-button *ngFor="let label of this.labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: labels
        }
      }
    );

    spectator.tick();

    // Nothing should be selected
    expect(spectator.component.selectedLabel).toBeUndefined();
  }));

  test('should show selected label', fakeAsync(() => {
    spectator = createHost(
      `
      <htc-toggle-button-group [selectedLabel]="selectedLabel">
        <htc-toggle-button *ngFor="let label of labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          selectedLabel: 'Raw',
          labels: ['Parsed', 'Raw']
        }
      }
    );

    spectator.tick();

    const selectedButtonElements = spectator.queryAll('.htc-toggle-button > .selected');
    expect(selectedButtonElements.length).toBe(1);
    expect(selectedButtonElements[0]).toHaveText('Raw');
  }));

  test('should update buttons', fakeAsync(() => {
    const labels: string[] = [];
    spectator = createHost(
      `
      <htc-toggle-button-group>
        <htc-toggle-button *ngFor="let label of labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: labels
        }
      }
    );

    spectator.tick();

    let buttonElements = spectator.queryAll('.htc-toggle-button');
    expect(buttonElements.length).toBe(0);

    labels.push('first', 'second');

    spectator.tick();

    buttonElements = spectator.queryAll('.htc-toggle-button');
    expect(buttonElements.length).toBe(2);

    labels.push('third');
    spectator.tick();

    buttonElements = spectator.queryAll('.htc-toggle-button');
    expect(buttonElements.length).toBe(3);
  }));

  test('should propagate click events', fakeAsync(() => {
    const spySelectionChange = jest.fn();
    spectator = createHost(
      `
      <htc-toggle-button-group (selectedLabelChange)="selectedLabelChange($event)">
        <htc-toggle-button *ngFor="let label of this.labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: ['Parsed', 'Raw'],
          selectedLabelChange: spySelectionChange
        }
      }
    );

    spectator.tick();

    const buttonElements = spectator.queryAll('.htc-toggle-button > button');
    expect(buttonElements.length).toBe(2);

    spectator.dispatchFakeEvent(buttonElements[1], 'click', true);
    spectator.tick();

    expect(spySelectionChange).toHaveBeenCalled();
  }));

  test('should disable all child buttons', fakeAsync(() => {
    spectator = createHost(
      `
      <htc-toggle-button-group [disabled]="disabled">
        <htc-toggle-button *ngFor="let label of this.labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: ['Parsed', 'Raw'],
          disabled: true
        }
      }
    );

    spectator.tick();

    const buttonElements = spectator.queryAll('.htc-toggle-button > .disabled');
    expect(buttonElements.length).toBe(2);
  }));

  test('should show specific first and last button border style', fakeAsync(() => {
    spectator = createHost(
      `
      <htc-toggle-button-group>
        <htc-toggle-button *ngFor="let label of this.labels" [label]="label"></htc-toggle-button>
      </htc-toggle-button-group>
    `,
      {
        hostProps: {
          labels: ['Parsed', 'Raw']
        }
      }
    );

    spectator.tick();

    const buttonElements = spectator.queryAll('.htc-toggle-button > .button');
    expect(buttonElements).not.toBeNull();
    expect(buttonElements.length).toBe(2);

    const firstButtonElements = spectator.queryAll('.htc-toggle-button > .first');
    expect(firstButtonElements).not.toBeNull();
    expect(firstButtonElements.length).toBe(1);

    const lastButtonElements = spectator.queryAll('.htc-toggle-button > .last');
    expect(lastButtonElements).not.toBeNull();
    expect(lastButtonElements.length).toBe(1);

    expect(buttonElements[0]).toEqual(firstButtonElements[0]);
    expect(buttonElements[1]).toEqual(lastButtonElements[0]);
  }));
});
