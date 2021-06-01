import { IconType } from '@hypertrace/assets-library';
import { createHostFactory } from '@ngneat/spectator/jest';
import { MockComponent, MockModule } from 'ng-mocks';
import { IconComponent } from '../icon/icon.component';
import { LabelComponent } from '../label/label.component';
import { TooltipModule } from '../tooltip/tooltip.module';
import { FormFieldComponent } from './form-field.component';

describe('Form Field Component', () => {
  const hostFactory = createHostFactory({
    component: FormFieldComponent,
    declarations: [MockComponent(LabelComponent), MockComponent(IconComponent)],
    imports: [MockModule(TooltipModule)],
    shallow: true
  });

  test('should show mandatory form field data', () => {
    const spectator = hostFactory(
      `
    <ht-form-section [infoLabel]="infoLabel" [icon]="icon" [infoIconTooltip]="infoIconTooltip" [errorLabel]="errorLabel">
    </ht-form-section>`,
      {
        hostProps: {
          infoLabel: 'Label',
          icon: IconType.Info,
          infoIconTooltip: 'Add or update a text',
          errorLabel: 'Error message'
        }
      }
    );
    const labels = spectator.queryAll(LabelComponent);
    expect(labels[0].label).toEqual('Label');
    expect(labels[1].label).toEqual('Error message');

    const icon = spectator.query(IconComponent);
    expect(icon?.icon).toEqual(IconType.Info);
  });

  test('should show optional form field data', () => {
    const spectator = hostFactory(
      `
    <ht-form-section [infoLabel]="infoLabel" [optional]="optional" [infoIconTooltip]="infoIconTooltip">
    </ht-form-section>`,
      {
        hostProps: {
          infoLabel: 'Label',
          icon: IconType.Info,
          infoIconTooltip: 'Add or update a text',
          optional: true
        }
      }
    );
    const labels = spectator.queryAll(LabelComponent);
    expect(labels[0].label).toEqual('Label');
    expect(labels[1].label).toEqual('(Optional)');
  });
});
