import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { ListViewKeyRendererDirective } from './list-view-key-renderer.directive';
import { ListViewValueRendererDirective } from './list-view-value-renderer.directive';
import { Dictionary } from '@hypertrace/common';

@Component({
  selector: 'ht-list-view',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #defaultValueRenderer let-record
      ><span>{{ record.value }}</span></ng-template
    >
    <ng-template #defaultKeyRenderer let-record
      ><span>{{ record.key }}</span></ng-template
    >

    <div class="list-view">
      <div *ngIf="this.header" class="header-row">
        <div class="header-key-label">
          <span>{{ this.header.keyLabel }}</span>
        </div>
        <div class="header-value-label">
          <span>{{ this.header.valueLabel }}</span>
        </div>
      </div>
      <ng-container *ngFor="let record of this.records">
        <div class="data-row" [class]="this.display">
          <div class="key">
            <ng-container
              *ngTemplateOutlet="
                this.keyRenderer ? this.keyRenderer!.getTemplateRef() : defaultKeyRenderer;
                context: { $implicit: record }
              "
            ></ng-container>
          </div>
          <div class="value">
            <ng-container
              *ngTemplateOutlet="
                this.valueRenderer ? this.valueRenderer!.getTemplateRef() : defaultValueRenderer;
                context: { $implicit: record }
              "
            ></ng-container>
          </div>
        </div>
        <ng-container *ngIf="!(this.getMetadataForKey | htMemoize: record.key | htIsEmpty)">
          <div class="metadata-row">Metadata :</div>
          <div class="metadata-row" *ngFor="let item of this.getMetadataForKey | htMemoize: record.key">
            <div class="marker"></div>
            <div class="key">{{ item[0] }} :</div>
            <div class="value">{{ item[1] }}</div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class ListViewComponent {
  @Input()
  public header?: ListViewHeader;

  @Input()
  public records?: ListViewRecord[];

  @Input()
  public metadata?: Dictionary<Dictionary<unknown>>;

  @Input()
  public display: ListViewDisplay = ListViewDisplay.Striped;

  @ContentChild(ListViewValueRendererDirective)
  public valueRenderer?: ListViewValueRendererDirective;

  @ContentChild(ListViewKeyRendererDirective)
  public keyRenderer?: ListViewKeyRendererDirective;

  public readonly getMetadataForKey = (key: string): [string, unknown][] => Object.entries(this.metadata?.[key] ?? {});
}

export interface ListViewHeader {
  keyLabel: string;
  valueLabel: string;
}

export interface ListViewRecord<PossibleValues = string | number> {
  key: string;
  value: PossibleValues;
}

export enum ListViewDisplay {
  Plain = 'plain',
  Striped = 'striped',
  BorderSeparated = 'border-separated'
}
