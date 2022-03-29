import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { ListViewKeyRendererDirective } from './list-view-key-renderer.directive';
import { ListViewValueRendererDirective } from './list-view-value-renderer.directive';

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
      <div class="data-row" [class]="this.display.toLowerCase()" *ngFor="let record of this.records">
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
    </div>
  `
})
export class ListViewComponent {
  @Input()
  public header?: ListViewHeader;

  @Input()
  public records?: ListViewRecord[];

  @Input()
  public display: ListViewDisplay = ListViewDisplay.Striped;

  @ContentChild(ListViewValueRendererDirective)
  public valueRenderer?: ListViewValueRendererDirective;

  @ContentChild(ListViewKeyRendererDirective)
  public keyRenderer?: ListViewKeyRendererDirective;
}

export interface ListViewHeader {
  keyLabel: string;
  valueLabel: string;
}

export interface ListViewRecord {
  key: string;
  value: string | number;
}

export enum ListViewDisplay {
  Plain = 'PLAIN',
  Striped = 'STRIPED'
}
