import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';

@Component({
  selector: 'htc-detail-sheet-interaction-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [hdaDashboardModel]="this.detailModel"></ng-container>`
})
export class DetailSheetInteractionContainerComponent {
  public constructor(@Inject(DETAIL_SHEET_INTERACTION_MODEL) public readonly detailModel: object) {}
}

export const DETAIL_SHEET_INTERACTION_MODEL = new InjectionToken<object>('DETAIL_SHEET_INTERACTION_MODEL');
