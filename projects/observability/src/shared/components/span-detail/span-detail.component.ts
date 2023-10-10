import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ToggleItem } from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { Observable, ReplaySubject } from 'rxjs';
import { SpanData } from './span-data';
import { SpanDetailLayoutStyle } from './span-detail-layout-style';
import { SpanDetailTab } from './span-detail-tab';

@Component({
  selector: 'ht-span-detail',
  styleUrls: ['./span-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="span-detail" *ngIf="this.spanData">
      <ng-container *ngIf="this.tabs.length > 0; else notAvailableTpl">
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
          [activeItem]="this.activeTab$ | async"
          [items]="this.tabs"
          (activeItemChange)="this.changeTab($event)"
        >
        </ht-toggle-group>

        <div class="tab-container" *ngIf="this.activeTab$ | async as activeTab">
          <ng-container [ngSwitch]="activeTab?.value">
            <ng-container *ngSwitchCase="'${SpanDetailTab.Request}'">
              <ht-span-request-detail
                class="request"
                [layout]="this.layout"
                [requestHeaders]="this.spanData?.requestHeaders"
                [requestCookies]="this.spanData?.requestCookies"
                [requestBody]="this.spanData?.requestBody"
                [scope]="this.scope"
              ></ht-span-request-detail>
            </ng-container>
            <ng-container *ngSwitchCase="'${SpanDetailTab.Response}'">
              <ht-span-response-detail
                class="response"
                [layout]="this.layout"
                [responseHeaders]="this.spanData?.responseHeaders"
                [responseCookies]="this.spanData?.responseCookies"
                [cookieMetadata]="this.spanData?.responseCookiesMetadata"
                [responseBody]="this.spanData?.responseBody"
                [scope]="this.scope"
              ></ht-span-response-detail>
            </ng-container>
            <ng-container *ngSwitchCase="'${SpanDetailTab.Attributes}'">
              <ht-span-tags-detail
                [tags]="this.spanData?.tags"
                [scope]="this.scope"
              ></ht-span-tags-detail>
            </ng-container>
            <ng-container *ngSwitchCase="'${SpanDetailTab.ExitCalls}'">
              <ht-span-exit-calls [exitCalls]="this.spanData?.exitCallsBreakup"></ht-span-exit-calls>
            </ng-container>
            <ng-container *ngSwitchCase="'${SpanDetailTab.Logs}'">
              <ht-log-events-table [logEvents]="this.spanData?.logEvents"></ht-log-events-table>
            </ng-container>
          </ng-container>
        </div>
      </ng-container>
    </div>

    <ng-template #notAvailableTpl>
      <div class="no-data-message">
        <ht-message-display icon="${IconType.NoData}" description="Span Details Not Available"></ht-message-display>
      </div>
    </ng-template>
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

  @Input()
  public scope: string = '';

  @Input()
  public showAttributesTab: boolean = true;
  @Output()
  public readonly closed: EventEmitter<void> = new EventEmitter<void>();
  public showRequestTab?: boolean;
  public showResponseTab?: boolean;
  public showExitCallsTab?: boolean;
  public showLogEventsTab?: boolean;
  public totalLogEvents?: number;
  public tabs: ToggleItem<SpanDetailTab>[] = [];
  @Output()
  private readonly activeTabLabelChange: EventEmitter<SpanDetailTab> = new EventEmitter<SpanDetailTab>();
  private readonly activeTabSubject: ReplaySubject<ToggleItem<SpanDetailTab>> = new ReplaySubject<
    ToggleItem<SpanDetailTab>
  >(1);
  public readonly activeTab$: Observable<ToggleItem<SpanDetailTab>> = this.activeTabSubject.asObservable();

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
      this.tabs = this.buildTabs();
    }
    if (changes.activeTabLabel) {
      const tab = this.tabs.find(({ value }) => value === this.activeTabLabel);
      if (tab) {
        this.changeTab(tab);
      }
    } else {
      if (this.tabs.length > 0) {
        this.changeTab(this.tabs[0]);
      }
    }
  }

  public changeTab(tab: ToggleItem<SpanDetailTab>): void {
    this.activeTabLabelChange.emit(tab.value);
    this.activeTabSubject.next(tab);
  }

  /**
   * Tabs are added in order:
   * 1. Request
   * 2. Response
   * 3. Attributes
   * 4. Exit calls
   * 5. Log events
   */
  private buildTabs(): ToggleItem<SpanDetailTab>[] {
    const tabs: ToggleItem<SpanDetailTab>[] = [];
    if (this.showRequestTab) {
      tabs.push({ label: SpanDetailTab.Request, value: SpanDetailTab.Request });
    }
    if (this.showResponseTab) {
      tabs.push({ label: SpanDetailTab.Response, value: SpanDetailTab.Response });
    }
    if (this.showAttributesTab) {
      tabs.push({ label: SpanDetailTab.Attributes, value: SpanDetailTab.Attributes });
    }
    if (this.showExitCallsTab) {
      tabs.push({ label: SpanDetailTab.ExitCalls, value: SpanDetailTab.ExitCalls });
    }
    if (this.showLogEventsTab) {
      tabs.push({ label: SpanDetailTab.Logs, value: SpanDetailTab.Logs });
    }

    return tabs;
  }
}
