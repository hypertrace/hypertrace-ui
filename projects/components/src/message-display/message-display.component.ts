import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-message-display',
  styleUrls: ['./message-display.component.scss'],
  template: `
    <div class="ht-message-display">
      <ht-icon [icon]="this.icon" size="${IconSize.Large}"></ht-icon>
      <div class="title">{{ this.title }}</div>
      <div class="description">{{ this.description }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDisplayComponent {
  @Input()
  public icon?: string;

  @Input()
  public title: string = '';

  @Input()
  public description: string = '';
}
