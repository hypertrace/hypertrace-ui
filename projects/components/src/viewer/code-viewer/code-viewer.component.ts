import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Color, TypedSimpleChanges } from '@hypertrace/common';
import * as HighlightJs from 'highlight.js';
import { isEmpty } from 'lodash-es';
import { of } from 'rxjs';
import { DownloadFileMetadata } from '../../download-file/download-file-metadata';
import { CodeLanguage } from './code-language';

@Component({
  selector: 'ht-code-viewer',
  styleUrls: ['./code-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-viewer" [style.backgroundColor]="this.backgroundColor">
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
      <div id="code-viewer-content" class="content" [ngClass]="{ 'no-data': this.isCodeEmpty }">
        <ng-container *ngIf="!this.isCodeEmpty; else noDataTemplate"
          ><div class="line-numbers">
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
              <pre class="code-line-text" [innerHtml]="codeLine"></pre>
              <div #codeLineBackground class="code-line-background"></div>
            </div>
          </div>
          <ht-copy-to-clipboard
            *ngIf="this.enableCopy"
            class="copy-to-clipboard"
            [tooltip]="this.copyTooltip"
            [label]="this.copyLabel"
            [text]="this.code"
          ></ht-copy-to-clipboard>
        </ng-container>
        <ng-template #noDataTemplate>
          <ht-message-display icon="${IconType.NoData}" [title]="this.noDataMessage"></ht-message-display>
        </ng-template>
      </div>
    </div>
  `
})
export class CodeViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  public code: string = ''; // Pre-formatted code string

  @Input()
  public language: CodeLanguage = CodeLanguage.Yaml; // Need a default language by highlight.js

  @Input()
  public highlightText: string = ''; // To highlight the entire line

  @Input()
  public titleText: string = 'Code Viewer';

  @Input()
  public noDataMessage: string = 'No code available';

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

  @ViewChildren('codeLineBackground', { read: ElementRef })
  private readonly codeLineBackgroundElements!: QueryList<ElementRef>;

  public codeTexts: string[] = [];
  public codeLines: string[] = []; // HTML strings after syntax highlighting
  public downloadCodeMetadata?: DownloadFileMetadata;
  public lineNumbers: number[] = [];

  private readonly domMutationObserver: MutationObserver = new MutationObserver(mutations =>
    this.onDomMutation(mutations)
  );

  public constructor(private readonly element: ElementRef) {}

  public ngAfterViewInit(): void {
    this.observeDomMutations();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.code || changes.codeLanguage) {
      this.codeTexts = isEmpty(this.code) ? [] : this.code.split(this.lineSplitter);
      this.codeLines = this.codeTexts.map(
        codeStr => HighlightJs.default.highlight(codeStr, { language: this.language }).value
      );
      this.lineNumbers = new Array(this.codeLines.length).fill(0).map((_, index) => index + 1);
    }

    if (changes.code || changes.downloadFileName) {
      this.downloadCodeMetadata = {
        dataSource: of(this.code),
        fileName: this.downloadFileName
      };
    }
  }

  public ngOnDestroy(): void {
    this.domMutationObserver.disconnect();
  }

  public get isCodeEmpty(): boolean {
    return isEmpty(this.code);
  }

  public isLineHighlighted(lineNum: number): boolean {
    return (
      !isEmpty(this.highlightText) && this.codeLines[lineNum].toLowerCase().includes(this.highlightText.toLowerCase())
    );
  }

  public onSearch(searchString: string): void {
    // For case-insensitive search
    const searchText = searchString.toLowerCase();
    const codeTexts = this.codeTexts.map(text => text.toLowerCase());

    // Remove existing child background elements
    this.codeLineBackgroundElements.forEach(
      codeLineBackgroundElement => (codeLineBackgroundElement.nativeElement.innerHTML = '')
    );

    const searchLen: number = searchText.length;
    if (searchLen === 0) {
      return;
    }

    const searchedPositions: Position[][] = Array.from(Array(codeTexts.length), () => []);

    // Get all searched text positions
    codeTexts.forEach((codeText, index) => {
      for (let i = 0; i <= codeText.length - searchLen; i++) {
        const searchedIndex = codeText.indexOf(searchText, i);
        if (searchedIndex > -1) {
          searchedPositions[index].push({ start: searchedIndex, end: searchedIndex + searchLen });
          i = searchedIndex + searchLen - 1;
        } else {
          break;
        }
      }
    });

    // Add background elements for searched positions
    this.codeLineBackgroundElements.forEach((codeLineBackgroundElement, index) => {
      codeLineBackgroundElement.nativeElement.appendChild(this.getBackgroundElements(searchedPositions[index]));
    });
  }

  // Background elements for search
  private getBackgroundElements(positions: Position[]): DocumentFragment {
    const backgroundElemDocFragment: DocumentFragment = document.createDocumentFragment();

    positions.forEach(position => {
      const backgroundElem = document.createElement('div');
      backgroundElem.className = 'bg-searched';
      backgroundElem.style.height = '100%';
      backgroundElem.style.width = `${position.end - position.start}ch`;
      backgroundElem.style.backgroundColor = Color.Yellow4;
      backgroundElem.style.position = 'absolute';
      backgroundElem.style.left = `${position.start}ch`;

      backgroundElemDocFragment.appendChild(backgroundElem);
    });

    return backgroundElemDocFragment;
  }

  private observeDomMutations(): void {
    const codeViewerContentElement = this.element.nativeElement.querySelector('#code-viewer-content') as Node;
    this.domMutationObserver.observe(codeViewerContentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private onDomMutation(mutations: MutationRecord[]): void {
    const mutationType: MutationRecordType = mutations[0].type;

    if (mutationType === 'childList') {
      const searchedElement: HTMLElement = this.element.nativeElement.querySelector('.bg-searched');
      searchedElement?.scrollIntoView();
    } else if (mutationType === 'attributes') {
      const highlightedCodeLineElement: HTMLElement = this.element.nativeElement.querySelector('.line-highlight');
      highlightedCodeLineElement?.scrollIntoView();
    }
  }
}

interface Position {
  start: number;
  end: number;
}
