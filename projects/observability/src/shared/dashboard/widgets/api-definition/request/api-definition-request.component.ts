import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { TableColumnConfig, TableDataSource, ToggleViewMode } from '@hypertrace/components';
import { isNil } from 'lodash';
import { EMPTY, Observable, of } from 'rxjs';
import { ApiParameters } from '../data/api-definition-data-source.model';

@Component({
  selector: 'ht-api-definition-request',
  styleUrls: ['./api-definition-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-api-definition-request fill-container">
      <div class="param-table">
        <htc-label class="title" label="Parameters"></htc-label>
        <htc-table
          class="table"
          [columnConfigs]="this.columnDefs"
          [data]="this.datasource"
          [searchable]="false"
          [pageable]="false"
        >
        </htc-table>
      </div>
      <div class="request-body">
        <htc-label label="Body" class="title"></htc-label>
        <div class="container">
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
      </div>
    </div>
  `
})
export class ApiDefinitionRequestComponent implements OnChanges {
  @Input()
  public params: ApiParameters[] = [];

  @Input()
  public bodySchema?: string;

  public columnDefs: TableColumnConfig[] = [
    {
      field: 'name',
      visible: true,
      sortable: true,
      title: 'Key'
    },
    {
      field: 'valueType',
      visible: true,
      sortable: true,
      title: 'Value Type'
    },
    {
      field: 'parameterType',
      visible: true,
      sortable: true,
      title: 'Parameter Type'
    },
    {
      field: 'pii',
      visible: true,
      sortable: true,
      title: 'PII'
    }
  ];
  public datasource?: TableDataSource<ApiParameters>;

  public bodyRecord$?: Observable<BodyRecord>;
  public readonly parsed: string = 'Parsed';
  public readonly raw: string = 'Raw';

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.params && this.params) {
      this.setDatasource();
    }

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

  private setDatasource(): void {
    this.datasource = {
      getData: () =>
        of({
          data: this.params,
          totalCount: this.params.length
        })
    };
  }
}

interface BodyRecord {
  parsed: object;
  raw: string;
  selectedLabel: string;
}
