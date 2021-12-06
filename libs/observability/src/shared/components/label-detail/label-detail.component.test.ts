import { IconType } from '@hypertrace/assets-library';
import { NavigationService } from '@hypertrace/common';
import {
  ButtonComponent,
  IconComponent,
  LabelComponent,
  PopoverComponent,
  PopoverModule
} from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { NEVER } from 'rxjs';
import { LabelDetailComponent, LabelDetailView } from './label-detail.component';

describe('Label Detail Component', () => {
  let spectator: Spectator<LabelDetailComponent>;

  const createHost = createHostFactory({
    component: LabelDetailComponent,
    shallow: true,
    imports: [PopoverModule],
    declarations: [MockComponent(ButtonComponent), MockComponent(LabelComponent), MockComponent(IconComponent)],
    providers: [
      mockProvider(NavigationService, {
        navigation$: NEVER
      })
    ]
  });

  test('should render all trigger contents for default/with-label view mode', () => {
    spectator = createHost(
      `<ht-label-detail [icon]="icon" [label]="label" [description]="description" [additionalDetails]="additionalDetails"></ht-label-detail>`,
      {
        hostProps: {
          icon: IconType.Add,
          label: 'Impact',
          description: 'This is a test description',
          additionalDetails: ['Additional Detail 1', 'Additional Detail 2']
        }
      }
    );

    expect(spectator.query('.label-detail-trigger')).toExist();
    expect(spectator.query('.detail-button')).not.toExist();
    expect(spectator.query('.label-icon')).toExist();
    expect(spectator.query(LabelComponent)?.label).toEqual('Impact');

    // On mouse enter, show detail button
    spectator.dispatchMouseEvent('.label-detail-trigger', 'mouseenter');
    spectator.detectChanges();
    expect(spectator.query('.detail-button')).toExist();
    expect(spectator.query('.label-icon')).not.toExist();

    // On mouse leave, hide detail button
    spectator.dispatchMouseEvent('.label-detail-trigger', 'mouseleave');
    spectator.detectChanges();
    expect(spectator.query('.detail-button')).not.toExist();
    expect(spectator.query('.label-icon')).toExist();

    // Check if correct options are passed to Popover component
    const popoverComponent = spectator.query(PopoverComponent);
    expect(popoverComponent?.closeOnClick).toEqual(false);
    expect(popoverComponent?.closeOnNavigate).toEqual(true);
    expect(popoverComponent?.locationPreferences).toEqual(spectator.component.locationPreferences);
  });

  test('should render all trigger contents for Icon only mode', () => {
    spectator = createHost(
      `<ht-label-detail [icon]="icon" [label]="label" [description]="description" [additionalDetails]="additionalDetails" [view]="view"></ht-label-detail>`,
      {
        hostProps: {
          icon: IconType.Add,
          label: 'Impact',
          description: 'This is a test description',
          additionalDetails: ['Additional Detail 1', 'Additional Detail 2'],
          view: LabelDetailView.IconOnly
        }
      }
    );

    expect(spectator.query('.label-detail-trigger')).toExist();
    expect(spectator.query('.detail-button')).not.toExist();
    expect(spectator.query('.label-icon')).toExist();
    expect(spectator.query(LabelComponent)).not.toExist();

    // On mouse enter, show detail button
    spectator.dispatchMouseEvent('.label-detail-trigger', 'mouseenter');
    spectator.detectChanges();
    expect(spectator.query('.detail-button')).toExist();
    expect(spectator.query('.label-icon')).not.toExist();
    expect(spectator.query(LabelComponent)).not.toExist();

    // On mouse leave, hide detail button
    spectator.dispatchMouseEvent('.label-detail-trigger', 'mouseleave');
    spectator.detectChanges();
    expect(spectator.query('.detail-button')).not.toExist();
    expect(spectator.query('.label-icon')).toExist();
    expect(spectator.query(LabelComponent)).not.toExist();

    // Check if correct options are passed to Popover component
    const popoverComponent = spectator.query(PopoverComponent);
    expect(popoverComponent?.closeOnClick).toEqual(false);
    expect(popoverComponent?.closeOnNavigate).toEqual(true);
    expect(popoverComponent?.locationPreferences).toEqual(spectator.component.locationPreferences);
  });

  test('should render all popover contents', () => {
    spectator = createHost(
      `<ht-label-detail [icon]="icon" [label]="label" [description]="description" [additionalDetails]="additionalDetails"></ht-label-detail>`,
      {
        hostProps: {
          icon: IconType.Add,
          label: 'Impact',
          description: 'This is a test description',
          additionalDetails: ['Additional Detail 1', 'Additional Detail 2']
        }
      }
    );

    spectator.click('.label-detail-trigger');

    expect(spectator.query('.popover-content', { root: true })).toExist();
    expect(spectator.query('.popover-content .label-display', { root: true })).toExist();
    expect(spectator.query('.popover-content .expanded', { root: true })).toExist();
    expect(spectator.query('.popover-content .label', { root: true })).toExist();
    expect(spectator.query('.popover-content .description', { root: true })).toHaveText('This is a test description');

    const additionalDetailElements = spectator.queryAll('.popover-content .text', { root: true });

    expect(additionalDetailElements[0]).toHaveText('Additional Detail 1');
    expect(additionalDetailElements[1]).toHaveText('Additional Detail 2');

    spectator.click(spectator.query('.popover-content .expanded', { root: true })!);
    expect(spectator.query('.popover-content', { root: true })).not.toExist();
  });
});
