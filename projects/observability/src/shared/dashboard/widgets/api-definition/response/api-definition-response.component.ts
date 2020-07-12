import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ToggleViewMode } from '@hypertrace/components';
import { isNil } from 'lodash';
import { EMPTY, Observable, of } from 'rxjs';

@Component({
  selector: 'ht-api-definition-response',
  styleUrls: ['./api-definition-response.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-api-definition-response fill-container">
      <htc-label label="Body" class="title"></htc-label>
      <ng-container *htcLoadAsync="this.bodyRecord$ as bodyRecord">
        <div class="content">
          <div class="toggle-button">
            <htc-toggle-button-group
              [(selectedLabel)]="bodyRecord.selectedLabel"
              [disabled]="!bodyRecord.parsed"
              viewMode="${ToggleViewMode.Text}"
            >
              <htc-toggle-button [label]="this.parsed"></htc-toggle-button>
              <htc-toggle-button [label]="this.raw"></htc-toggle-button>
            </htc-toggle-button-group>
          </div>

          <div class="body-viewer">
            <htc-json-viewer
              *ngIf="bodyRecord.selectedLabel === this.parsed"
              [json]="bodyRecord.parsed"
              class="json-viewer"
            ></htc-json-viewer>
            <pre *ngIf="bodyRecord.selectedLabel === this.raw" class="raw">{{ bodyRecord.raw }}</pre>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ApiDefinitionResponseComponent implements OnChanges {
  @Input()
  public bodySchema?: string;

  public bodyRecord$?: Observable<BodyRecord>;
  public readonly parsed: string = 'Parsed';
  public readonly raw: string = 'Raw';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.bodySchema) {
      this.parseRequestBody();
    }
  }

  private parseRequestBody(): void {
    try {
      const parsed = JSON.parse(this.bodySchema!) as object;
      if (isNil(parsed)) {
        this.bodyRecord$ = EMPTY;
      } else {
        this.bodyRecord$ = of({
          parsed: parsed,
          raw: this.getFormattedBody(parsed),
          selectedLabel: this.parsed
        });
      }
    } catch (e) {
      // Invalid Body. This may happen if the body contains an HTML for which we don't have a viewer yet.
      // In future, this should just log error.
      this.bodyRecord$ = EMPTY;
    }
  }

  private getFormattedBody(parsedBody: object): string {
    // tslint:disable-next-line: no-null-keyword
    return JSON.stringify(parsedBody, null, 2);
  }
}

interface BodyRecord {
  parsed: object;
  raw: string;
  selectedLabel: string;
}
