import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Json } from '@hypertrace/common';
import { JsonElementType, JsonRecord } from './json-viewer.type';

@Component({
  selector: 'htc-json-viewer',
  styleUrls: ['./json-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="json-viewer">
      <div class="property" *ngFor="let record of this.json | htcJsonRecords: this.showExpanded">
        <div class="record" (click)="onToggle(record)">
          <div class="toggle">
            <htc-icon
              *ngIf="record.isExpandable"
              icon="{{ !record.expanded ? this.collapsedIcon : this.expandedIcon }}"
              size="extra-small"
            ></htc-icon>
          </div>

          <span class="key">{{ record.keyDisplay }}:</span>

          <div [ngClass]="this.getDisplayValueStyle(record)" class="value">
            {{ record.valueDisplay }}
          </div>
        </div>

        <div class="expanded-object" *ngIf="record.isExpandable && record.expanded">
          <htc-json-viewer [json]="record.value" [showExpanded]="this.showExpanded"></htc-json-viewer>
        </div>
      </div>
    </div>
  `
})
export class JsonViewerComponent {
  @Input()
  public json?: Json;

  @Input()
  public showExpanded: boolean = true;

  public readonly expandedIcon: IconType = IconType.Expanded;
  public readonly collapsedIcon: IconType = IconType.Collapsed;

  public onToggle(record: JsonRecord): void {
    record.expanded = !record.expanded;
  }

  public getDisplayValueStyle(record: JsonRecord): DisplayValueStyle {
    if (record.valueType === JsonElementType.String) {
      return DisplayValueStyle.String;
    }

    if (record.valueType === JsonElementType.Null) {
      return DisplayValueStyle.Null;
    }

    if (record.isExpandable) {
      return DisplayValueStyle.Summary;
    }

    return DisplayValueStyle.Primitive;
  }
}

const enum DisplayValueStyle {
  String = 'string-value',
  Primitive = 'primitive-value',
  Summary = 'summary-value',
  Null = 'null-value'
}
