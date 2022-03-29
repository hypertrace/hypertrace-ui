import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { isEmpty, isNil } from 'lodash-es';
import { Color, TypedSimpleChanges } from '@hypertrace/common';
import { DownloadFileMetadata } from '../download-file/download-file-metadata';

@Component({
  selector: 'ht-code-viewer',
  styleUrls: ['./code-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-viewer" [style.backgroundColor]="this.backgroundColor">
      <div class="header">
        <div class="title">{{ this.titleText }}</div>
        <div class="header-content">
          <ng-container *ngIf="this.additionalHeaderContent">
            <ng-container *ngTemplateOutlet="this.additionalHeaderContent"></ng-container
          ></ng-container>
          <ht-search-box
            class="search-box"
            backgroundColor="${Color.White}"
            (valueChange)="this.onSearch($event)"
          ></ht-search-box>
          <ht-download-file *ngIf="this.downloadCodeMetadata" [metadata]="this.downloadCodeMetadata"></ht-download-file>
        </div>
      </div>
      <div class="content">
        <div class="line-numbers">
          <div
            *ngFor="let lineNumber of this.lineNumbers"
            class="line-number"
            [ngClass]="{ highlight: this.isHighlighted(lineNumber - 1) }"
          >
            {{ lineNumber }}
          </div>
        </div>
        <div class="code-lines">
          <div
            *ngFor="let codeLine of this.code; let index = index"
            class="code-line"
            [ngClass]="{ highlight: this.isHighlighted(index) }"
          >
            <pre>{{ codeLine }}</pre>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CodeViewerComponent {
  @Input()
  public code: string[] = []; // Pre-formatted code lines as string

  @Input()
  public highlightText: string = ''; // To highlight the entire line

  @Input()
  public titleText: string = 'Code Viewer';

  @Input()
  public backgroundColor: string = Color.OffWhite;

  @Input()
  public downloadCodeMetadata?: DownloadFileMetadata;

  @Input()
  public additionalHeaderContent?: TemplateRef<unknown>;

  public codeLineElements?: HTMLElement[];

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.code) {
      this.codeLineElements = undefined;
    }
  }

  public get lineNumbers(): number[] {
    return new Array(this.code.length).fill(0).map((_, index) => index + 1);
  }

  public isHighlighted(lineNum: number): boolean {
    return !isEmpty(this.highlightText) && this.code[lineNum].toLowerCase().includes(this.highlightText.toLowerCase());
  }

  public onSearch(searchText: string): void {
    if (isNil(this.codeLineElements)) {
      this.codeLineElements = Array.from(document.getElementsByClassName('code-line') ?? []) as HTMLElement[];
    }

    this.codeLineElements.forEach((codeLineElem, index) => {
      const codeLine: string = this.code[index];
      codeLineElem.innerHTML = this.getReplacedHtmlString(codeLine, searchText);
    });
  }

  /**
   * This gives the replaced HTML string after search.
   * It uses regex to replace the searched text with a span if found
   */
  private getReplacedHtmlString(codeLine: string, searchText: string): string {
    const searchRegex: RegExp = new RegExp(searchText, 'gi');
    const resultString: string = !isEmpty(searchText)
      ? codeLine.replace(searchRegex, value => `<span style="background-color: ${Color.Yellow4}">${value}</span>`)
      : codeLine;
    return `<pre>${resultString}</pre>`;
  }
}
