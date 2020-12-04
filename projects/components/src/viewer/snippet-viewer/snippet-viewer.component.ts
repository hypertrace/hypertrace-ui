import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-snippet-viewer',
  styleUrls: ['./snippet-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="snippet-viewer">
      <ht-copy-to-clipboard
        *ngIf='this.enableCopy'
        class='copy-to-clipboard'
        [label]='this.copyLabel'
        [tooltip]='this.copyTooltip'
        [text]='this.snippet'
      ></ht-copy-to-clipboard>
      <ng-container *ngFor="let line of this.lines; let lineNumber = index">
        <div class="line-number">
          <span>{{ lineNumber + 1 }}</span>
        </div>
        <div class="content">
          <span>{{ line }}</span>
        </div>
      </ng-container>
    </div>
  `
})
export class SnippetViewerComponent implements OnChanges {
  @Input()
  public snippet?: string;

  @Input()
  public enableCopy?: boolean = true;

  @Input()
  public copyLabel?: string = 'Copy to Clipboard';

  @Input()
  public copyTooltip?: string = 'Copy to Clipboard';

  public lines: string[] = [];

  private readonly lineSplitter: RegExp = new RegExp('\r\n|\r|\n');

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.snippet) {
      this.lines = this.snippet !== undefined ? this.snippet.split(this.lineSplitter) : [];
    }
  }
}
