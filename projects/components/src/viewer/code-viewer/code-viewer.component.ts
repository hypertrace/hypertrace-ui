import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef } from '@angular/core';
import { Color, TypedSimpleChanges } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';
import { of } from 'rxjs';
import { DownloadFileMetadata } from '../../download-file/download-file-metadata';

@Component({
  selector: 'ht-code-viewer',
  styleUrls: ['./code-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="this.code" class="code-viewer" [style.backgroundColor]="this.backgroundColor">
      <div *ngIf="this.showHeader" class="header">
        <div class="title">{{ this.titleText }}</div>
        <div class="header-content">
          <ng-container *ngIf="this.additionalHeaderContent">
            <ng-container *ngTemplateOutlet="this.additionalHeaderContent"></ng-container
          ></ng-container>
          <ht-search-box
            *ngIf="this.enableSearch"
            class="search-box"
            (valueChange)="this.onSearch($event)"
          ></ht-search-box>
          <ht-download-file
            *ngIf="!!this.code && !!this.downloadFileName"
            [metadata]="this.downloadCodeMetadata"
          ></ht-download-file>
        </div>
      </div>
      <div class="content">
        <div class="line-numbers">
          <div
            *ngFor="let lineNumber of this.lineNumbers"
            class="line-number"
            [ngClass]="{ 'line-highlight': this.isLineHighlighted(lineNumber - 1) }"
          >
            {{ lineNumber }}
          </div>
        </div>
        <div class="code-lines">
          <div
            *ngFor="let codeLine of this.codeLines; let index = index"
            class="code-line"
            [ngClass]="{ 'line-highlight': this.isLineHighlighted(index) }"
          >
            <pre
              [innerHtml]="
                this.searchText ? (codeLine | htHighlight: { text: this.searchText, highlightType: 'mark' }) : codeLine
              "
            ></pre>
          </div>
        </div>
        <ht-copy-to-clipboard
          *ngIf="this.enableCopy"
          class="copy-to-clipboard"
          [tooltip]="this.copyTooltip"
          [label]="this.copyLabel"
          [text]="this.code"
        ></ht-copy-to-clipboard>
      </div>
    </div>
  `
})
export class CodeViewerComponent implements OnChanges {
  @Input()
  public code: string = ''; // Pre-formatted code string

  @Input()
  public highlightText: string = ''; // To highlight the entire line

  @Input()
  public titleText: string = 'Code Viewer';

  @Input()
  public backgroundColor: string = Color.OffWhite;

  @Input()
  public enableCopy: boolean = false;

  @Input()
  public copyLabel: string = '';

  @Input()
  public copyTooltip: string = 'Copy to Clipboard';

  @Input()
  public enableSearch: boolean = true;

  @Input()
  public showHeader: boolean = true;

  @Input()
  public downloadFileName: string = '';

  @Input()
  public additionalHeaderContent?: TemplateRef<unknown>;

  @Input()
  public lineSplitter: RegExp = new RegExp('\r\n|\r|\n');

  public codeLines: string[] = [];
  public downloadCodeMetadata?: DownloadFileMetadata;
  public lineNumbers: number[] = [];
  public searchText: string = '';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.code) {
      this.codeLines = isEmpty(this.code) ? [] : this.code.split(this.lineSplitter);
      this.lineNumbers = new Array(this.codeLines.length).fill(0).map((_, index) => index + 1);
    }

    if (changes.code || changes.downloadFileName) {
      this.downloadCodeMetadata = {
        dataSource: of(this.code),
        fileName: this.downloadFileName
      };
    }
  }

  public isLineHighlighted(lineNum: number): boolean {
    return (
      !isEmpty(this.highlightText) && this.codeLines[lineNum].toLowerCase().includes(this.highlightText.toLowerCase())
    );
  }

  public onSearch(searchText: string): void {
    this.searchText = searchText;
  }
}
