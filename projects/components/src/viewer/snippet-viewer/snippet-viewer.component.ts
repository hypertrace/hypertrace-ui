import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'htc-snippet-viewer',
  styleUrls: ['./snippet-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="snippet-viewer">
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
/**
 * For more addition, consider using @CodeMirror
 */
export class SnippetViewerComponent implements OnChanges {
  @Input()
  public snippet?: string;

  public lines: string[] = [];

  private readonly lineSplitter: RegExp = new RegExp('\r\n|\r|\n');

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.snippet) {
      this.lines = this.snippet !== undefined ? this.snippet.split(this.lineSplitter) : [];
    }
  }
}
