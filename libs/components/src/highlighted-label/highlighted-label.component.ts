import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Dictionary, TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-highlighted-label',
  styleUrls: ['./highlighted-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="highlighted-label">
    <div class="tokens">
      <span *ngFor="let token of this.tokens" [ngClass]="{ highlight: token.highlight }">{{ token.value }}</span>
    </div>
  </div>`
})
export class HighlightedLabelComponent implements OnChanges {
  @Input()
  public templateString?: string;

  @Input()
  public data?: Dictionary<string | number>;

  public tokens: Token[] = [];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.templateString || changes.data) {
      this.tokens = this.tokenizeAndProcessTemplateString();
    }
  }

  /**
   * Create a token for each word in the template string.
   * Tokens for placeholder words will contain the intended value.
   */
  private tokenizeAndProcessTemplateString(): Token[] {
    if (this.templateString === undefined || this.data === undefined) {
      return [];
    }

    const regex = /{\w+}|[^{]+/g;

    return (this.templateString.match(regex) ?? []).map(token =>
      token[0] === '{'
        ? { value: String(this.data?.[token.substr(1, token.length - 2)]), highlight: true }
        : { value: token, highlight: false }
    );
  }
}

interface Token {
  value: string;
  highlight: boolean;
}
