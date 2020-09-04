import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'htc-greeting-label',
  styleUrls: ['./greeting-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="greeting-label">{{ this.greetingMessage }}</div>`
})
export class GreetingLabelComponent implements OnChanges {
  @Input()
  public readonly suffixLabel: string = '';

  public greetingMessage: string = '';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.suffixLabel) {
      this.setGreetingMessage();
    }
  }

  private setGreetingMessage(): void {
    this.greetingMessage = `${this.getGreeting()}${this.suffixLabel}`;
  }

  private getGreeting(): string {
    const hour = new Date().getHours();

    if (hour > 4 && hour < 12) {
      return 'Good Morning';
    }

    if (hour > 12 && hour < 17) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  }
}
