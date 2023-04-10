import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { ButtonRole, ButtonSize } from '../button/button';
import { RefreshButtonService } from './refresh-button.service';

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
      (click)="refresh()"
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

  public constructor(private readonly refreshButtonService: RefreshButtonService) {}

  public refresh() {
    this.refreshButtonService.refresh();
  }
}
