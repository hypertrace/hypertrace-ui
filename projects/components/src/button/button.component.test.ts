import { RouterTestingModule } from '@angular/router/testing';
import { IconType } from '@hypertrace/assets-library';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { IconSize } from '../icon/icon-size';
import { ButtonRole, ButtonSize, ButtonStyle } from './button';
import { ButtonComponent } from './button.component';
import { ButtonModule } from './button.module';

describe('Button Component', () => {
  let spectator: Spectator<ButtonComponent>;

  const createHost = createHostFactory({
    component: ButtonComponent,
    imports: [ButtonModule, RouterTestingModule],
    providers: [],
    declareComponent: false
  });

  test('should have correct default style', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    expect(spectator.query('.button')).toHaveClass('button secondary small solid');
  });

  test('should have correct style class for selected role', () => {
    spectator = createHost(`<ht-button [label]="label"></ht-button>`, {
      hostProps: {
        label: 'Button'
      }
    });

    // Primary
    spectator.setInput({
      role: ButtonRole.Primary
    });
    expect(spectator.query('.button')).toHaveClass('button primary small solid');

    // Secondary
    spectator.setInput({
      role: ButtonRole.Secondary
    });
    expect(spectator.query('.button')).toHaveClass('button secondary small solid');

    // Tertiary
    spectator.setInput({
      role: ButtonRole.Tertiary
    });
    expect(spectator.query('.button')).toHaveClass('button tertiary small solid');

    // Destructive
    spectator.setInput({
      role: ButtonRole.Destructive
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
    expect(spectator.component.getIconSizeClass()).toEqual(IconSize.Small);

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

  test('should render Icon and label correctly', () => {
    spectator = createHost(`<ht-button [icon]="icon"></ht-button>`, {
      hostProps: {
        icon: IconType.Add
      }
    });

    expect(spectator.query('.icon.leading')).toExist();
    expect(spectator.query('.icon.trailing')).not.toExist();
    expect(spectator.query('.label')).not.toExist();
    expect(spectator.query('.flipped')).not.toExist();

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
      trailingIcon: true
    });

    expect(spectator.query('.icon.trailing')).toExist();
    expect(spectator.query('.icon.leading')).not.toExist();
    expect(spectator.query('.label')).toExist();
    expect('.conditional-padding.trailing').toExist();
  });
});
