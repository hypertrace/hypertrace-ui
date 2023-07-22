import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { SHEET_DATA } from '@hypertrace/components';

@Component({
  selector: 'ht-detail-sheet-interaction-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [hdaDashboardModel]="this.detailModel"></ng-container>`
})
export class DetailSheetInteractionContainerComponent {
  public constructor(@Inject(SHEET_DATA) public readonly detailModel: object) {}
}
