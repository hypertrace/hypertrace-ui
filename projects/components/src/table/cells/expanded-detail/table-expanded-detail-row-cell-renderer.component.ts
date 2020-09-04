import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { StatefulTableRow } from '../../table-api';

@Component({
  selector: 'htc-table-expanded-detail-row-cell-renderer',
  styleUrls: ['./table-expanded-detail-row-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rowExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ],
  template: `
    <div *ngIf="!!this.content" [class.expanded]="this.expanded" class="table-expanded-cell-renderer">
      <div [@rowExpand]="this.expanded ? 'expanded' : 'collapsed'" class="expandable-column-row">
        <ng-container *ngTemplateOutlet="this.content; context: { row: this.row }"></ng-container>
      </div>
    </div>
  `
})
export class TableExpandedDetailRowCellRendererComponent {
  @Input()
  public row?: StatefulTableRow;

  @Input()
  public expanded?: boolean;

  @Input()
  public content?: TemplateRef<{ row: StatefulTableRow }>;
}
