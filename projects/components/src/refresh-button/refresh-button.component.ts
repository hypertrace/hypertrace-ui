import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonRole, ButtonSize } from '../button/button';

@Component({
  selector: 'ht-refresh-button',
  template: `
    <ht-button
      class="refresh"
      [class.emphasized]="this.isEmphasized"
      [label]="this.label"
      icon="${IconType.Refresh}"
      [size]="this.size"
      [role]="this.role"
    >
    </ht-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshButtonComponent {
  @Input()
  public isEmphasized: boolean = false;

  @Input()
  public role: ButtonRole = ButtonRole.Tertiary;

  @Input()
  public size: ButtonSize = ButtonSize.Small;

  @Input()
  public label: string = 'Refresh';
}
