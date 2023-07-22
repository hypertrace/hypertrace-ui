import { RouterTestingModule } from '@angular/router/testing';
import { IconType } from '@hypertrace/assets-library';
import { TrackDirective } from '@hypertrace/common';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';
import { IconSize } from '../icon/icon-size';
import { ButtonVariant, ButtonSize, ButtonStyle, ButtonType } from './button';
import { ButtonComponent } from './button.component';
import { ButtonModule } from './button.module';

describe('Button Component', () => {
  let spectator: Spectator<ButtonComponent>;

  const createHost = createHostFactory({
    component: ButtonComponent,
    imports: [ButtonModule, RouterTestingModule],
    declarations: [MockDirective(TrackDirective)],
    providers: [],
    declareComponent: false
  });

  test('should have correct default style', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    const buttonEl = spectator.query('.button');
    expect(buttonEl).toHaveClass('button secondary small solid');
    expect(buttonEl).toHaveAttribute('type', 'button');
  });

  test('should set correct button type', () => {
    spectator = createHost(`<ht-button [label]="label" [type]="type"></ht-button>`, {
      hostProps: {
        label: 'Button',
        type: ButtonType.Submit
      }
    });

    const buttonEl = spectator.query('.button');
    expect(buttonEl).toHaveClass('button secondary small solid');
    expect(buttonEl).toHaveAttribute('type', 'submit');
  });

  test('should have correct style class for selected role', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    // Primary
    spectator.setInput({
      variant: ButtonVariant.Primary
    });
    expect(spectator.query('.button')).toHaveClass('button primary small solid');

    // Secondary
    spectator.setInput({
      variant: ButtonVariant.Secondary
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small solid');

    // Tertiary
    spectator.setInput({
      variant: ButtonVariant.Tertiary
    });
    expect(spectator.query('.button')).toHaveClass('button tertiary small solid');

    // Quaternary
    spectator.setInput({
      variant: ButtonVariant.Quaternary
    });
    expect(spectator.query('.button')).toHaveClass('button quaternary small solid');

    // Destructive
    spectator.setInput({
      variant: ButtonVariant.Destructive
    });
    expect(spectator.query('.button')).toHaveClass('button destructive small solid');
  });

  test('should have correct style class for selected size', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    // Default
    expect(spectator.query('.button')).toHaveClass('button secondary small');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Small);

    // Extra Small
    spectator.setInput({
      size: ButtonSize.ExtraSmall
    });
    expect(spectator.query('.button')).toHaveClass('button secondary extra-small');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.ExtraSmall);

    // Large
    spectator.setInput({
      size: ButtonSize.Large
    });
    expect(spectator.query('.button')).toHaveClass('button secondary large');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Large);

    // Small
    spectator.setInput({
      size: ButtonSize.Small
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Small);

    // Medium
    spectator.setInput({
      size: ButtonSize.Medium
    });
    expect(spectator.query('.button')).toHaveClass('button secondary medium');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Medium);

    // Tiny
    spectator.setInput({
      size: ButtonSize.Tiny
    });
    expect(spectator.query('.button')).toHaveClass('button secondary tiny');
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Small);
  });

  test('should have correct style class for disabled state', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    // Default
    expect(spectator.query('.button')).not.toBe(spectator.query('.disabled'));

    // Disable
    spectator.setInput({
      disabled: true
    });
    expect(spectator.query('.button')).toBe(spectator.query('.disabled'));
  });

  test('should have correct style for button-style', () => {
    spectator = createHost(`<ht-button></ht-button>`);

    // Default
    expect(spectator.query('.button')).toHaveClass('button secondary small solid');

    // Outline
    spectator.setInput({
      display: ButtonStyle.Bordered
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small bordered');

    // Outlined Text
    spectator.setInput({
      display: ButtonStyle.Outlined
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small outlined');

    // Text
    spectator.setInput({
      display: ButtonStyle.Text
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small text');

    // Text
    spectator.setInput({
      display: ButtonStyle.PlainText
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small plain-text');

    // Solid
    spectator.setInput({
      display: ButtonStyle.Solid
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small solid');
  });

  test('should render Icons and label correctly', () => {
    spectator = createHost(`<ht-button [icon]="icon"></ht-button>`, {
      hostProps: {
        icon: IconType.Add
      }
    });

    expect(spectator.query('.icon.leading')).toExist();
    expect(spectator.query('.icon.trailing')).not.toExist();
    expect(spectator.query('.label')).not.toExist();

    // Set Label
    spectator.setInput({
      label: 'Button'
    });
    expect(spectator.query('.icon.leading')).toExist();
    expect(spectator.query('.icon.trailing')).not.toExist();
    expect(spectator.query('.label')).toExist();
    expect('.conditional-padding.leading').toExist();

    // Set Label
    spectator.setInput({
      trailingIcon: IconType.Add
    });

    expect(spectator.query('.icon.trailing')).toExist();
    expect(spectator.query('.icon.leading')).toExist();
    expect(spectator.query('.label')).toExist();
    expect('.conditional-padding.leading').toExist();
    expect('.conditional-padding.trailing').toExist();

    // Set Label
    spectator.setInput({
      icon: undefined
    });

    expect(spectator.query('.icon.trailing')).toExist();
    expect(spectator.query('.icon.leading')).not.toExist();
    expect(spectator.query('.label')).toExist();
    expect('.conditional-padding.leading').not.toExist();
    expect('.conditional-padding.trailing').toExist();
  });
});
