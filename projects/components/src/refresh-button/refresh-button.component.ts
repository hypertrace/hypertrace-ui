import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonVariant, ButtonSize } from '../button/button';

@Component({
  selector: 'ht-refresh-button',
  template: `
    <ht-button
      class="refresh"
      [class.emphasized]="this.isEmphasized"
      [label]="this.label"
      icon="${IconType.Refresh}"
      [size]="this.size"
      [variant]="this.variant"
    >
    </ht-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshButtonComponent {
  @Input()
  public isEmphasized: boolean = false;

  @Input()
  public variant: ButtonVariant = ButtonVariant.Tertiary;

  @Input()
  public size: ButtonSize = ButtonSize.Small;

  @Input()
  public label: string = 'Refresh';
}
