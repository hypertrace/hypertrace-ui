import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Observable } from 'rxjs';

@Component({
  selector: 'ht-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '' // No template, just gathering data
})
export class MenuItemComponent {
  @Input()
  public label!: string;

  @Input()
  public icon?: IconType;

  @Input()
  public iconColor?: string;

  @Input()
  public action?: () => Observable<any>;
}
