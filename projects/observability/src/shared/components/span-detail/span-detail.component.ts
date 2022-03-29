import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ToggleItem } from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { SpanData } from './span-data';
import { SpanDetailLayoutStyle } from './span-detail-layout-style';
import { SpanDetailTab } from './span-detail-tab';

@Component({
  selector: 'ht-span-detail',
  styleUrls: ['./span-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-detail" *ngIf="this.spanData">
      <ht-span-detail-title-header
        class="title-header"
        *ngIf="this.showTitleHeader"
        [serviceName]="this.spanData.serviceName"
        [protocolName]="this.spanData.protocolName"
        [apiName]="this.spanData.apiName"
        (closed)="this.closed.emit()"
      ></ht-span-detail-title-header>

      <div class="summary-container">
        <ng-content></ng-content>
      </div>

      <ht-toggle-group
        class="toggle-group"
        [activeItem]="activeTab$ | async"
        [items]="this.tabs"
        (activeItemChange)="this.tabChange($event)"
      >
      </ht-toggle-group>

      <div class="tab-container">
        <ng-container *ngTemplateOutlet="this.template$ | async"></ng-container>
      </div>

      <ng-template #requestTemplate>
        <ht-span-request-detail
          class="request"
          [layout]="this.layout"
          [requestHeaders]="this.spanData.requestHeaders"
          [requestCookies]="this.spanData.requestCookies"
          [requestBody]="this.spanData.requestBody"
        ></ht-span-request-detail>
      </ng-template>

      <ng-template #responseTemplate>
        <ht-span-response-detail
          class="response"
          [layout]="this.layout"
          [responseHeaders]="this.spanData.responseHeaders"
          [responseCookies]="this.spanData.responseCookies"
          [responseBody]="this.spanData.responseBody"
        ></ht-span-response-detail>
      </ng-template>

      <ng-template #attributesTemplate>
        <ht-span-tags-detail [tags]="this.spanData.tags"></ht-span-tags-detail>
      </ng-template>

      <ng-template #exitCallsTemplate>
        <ht-span-exit-calls [exitCalls]="this.spanData.exitCallsBreakup"></ht-span-exit-calls>
      </ng-template>

      <ng-template #logEventsTemplate>
        <ht-log-events-table [logEvents]="this.spanData?.logEvents"></ht-log-events-table>
      </ng-template>
    </div>
  `
})
export class SpanDetailComponent implements OnChanges {
  @Input()
  public spanData?: SpanData;

  @Input()
  public showTitleHeader: boolean = false;

  @Input()
  public layout: SpanDetailLayoutStyle = SpanDetailLayoutStyle.Horizontal;

  @Input()
  public activeTabLabel?: SpanDetailTab;

  @Output()
  private readonly activeTabLabelChange: EventEmitter<SpanDetailTab> = new EventEmitter<SpanDetailTab>();

  @Output()
  public readonly closed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('requestTemplate')
  public requestTemplate?: TemplateRef<unknown>;

  @ViewChild('responseTemplate')
  public responseTemplate?: TemplateRef<unknown>;

  @ViewChild('attributesTemplate')
  public attributesTemplate?: TemplateRef<unknown>;

  @ViewChild('exitCallsTemplate')
  public exitCallsTemplate?: TemplateRef<unknown>;

  @ViewChild('logEventsTemplate')
  public logEventsTemplate?: TemplateRef<unknown>;

  public showRequestTab?: boolean;
  public showResponseTab?: boolean;
  public showExitCallsTab?: boolean;
  public showLogEventsTab?: boolean;
  public totalLogEvents?: number;

  public readonly tabs: ToggleItem<SpanDetailTab>[] = [
    { label: SpanDetailTab.Request, value: SpanDetailTab.Request },
    { label: SpanDetailTab.Response, value: SpanDetailTab.Response },
    { label: SpanDetailTab.Attributes, value: SpanDetailTab.Attributes }
  ];

  private readonly activeTabSubject = new BehaviorSubject<ToggleItem<SpanDetailTab>>(this.tabs[0]);
  public readonly activeTab$ = this.activeTabSubject.asObservable();

  private readonly templateSubject = new Subject<TemplateRef<unknown>>();
  public readonly template$ = this.templateSubject.asObservable();

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.spanData) {
      this.showRequestTab =
        !isEmpty(this.spanData?.requestHeaders) ||
        !isEmpty(this.spanData?.requestCookies) ||
        !isEmpty(this.spanData?.requestBody);
      this.showResponseTab =
        !isEmpty(this.spanData?.responseHeaders) ||
        !isEmpty(this.spanData?.responseCookies) ||
        !isEmpty(this.spanData?.responseBody);
      this.showExitCallsTab = !isEmpty(this.spanData?.exitCallsBreakup);
      this.showLogEventsTab = !isEmpty(this.spanData?.logEvents);
      this.totalLogEvents = (this.spanData?.logEvents ?? []).length;
      if (this.showExitCallsTab && this.tabs.findIndex(({ value }) => value === SpanDetailTab.ExitCalls) === -1) {
        this.tabs.push({ label: SpanDetailTab.ExitCalls, value: SpanDetailTab.ExitCalls });
      }
      if (this.showLogEventsTab && this.tabs.findIndex(({ value }) => value === SpanDetailTab.Logs) === -1) {
        this.tabs.push({ label: SpanDetailTab.Logs, value: SpanDetailTab.Logs });
      }
    }
    if (changes.activeTabLabel) {
      const tab = this.tabs.find(({ value }) => value === this.activeTabLabel);
      if (tab) {
        this.activeTabSubject.next(tab);
      }
    }
  }

  public onActiveTabLabelChange(tabLabel: SpanDetailTab): void {
    this.activeTabLabel = tabLabel;
    this.activeTabLabelChange.emit(tabLabel);
  }

  public tabChange(tab: ToggleItem<SpanDetailTab>): void {
    if (tab.value) {
      const template = this.getTemplateForTab(tab.value);
      if (template) {
        this.templateSubject.next(template);
      }
    }
  }

  public getTemplateForTab(tab: SpanDetailTab): TemplateRef<unknown> | undefined {
    switch (tab) {
      case SpanDetailTab.Request:
        return this.requestTemplate;
      case SpanDetailTab.Response:
        return this.responseTemplate;
      case SpanDetailTab.Attributes:
        return this.attributesTemplate;
      case SpanDetailTab.ExitCalls:
        return this.exitCallsTemplate;
      case SpanDetailTab.Logs:
        return this.logEventsTemplate;
    }
  }
}
