import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { queryListAndChanges$ } from '@hypertrace/common';
import { asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { SelectGroupPosition } from './select-group-position';
import { SelectComponent } from './select.component';

@Component({
  selector: 'htc-select-group',
  styleUrls: ['./select-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="select-group-container">
      <ng-content select="htc-select"></ng-content>
    </div>
  `
})
export class SelectGroupComponent implements AfterContentInit {
  @ContentChildren(SelectComponent)
  private readonly selectChildren!: QueryList<SelectComponent<unknown>>;

  public ngAfterContentInit(): void {
    queryListAndChanges$(this.selectChildren)
      .pipe(observeOn(asyncScheduler))
      .subscribe(list => this.setPositions(list));
  }

  private setPositions(list: QueryList<SelectComponent<unknown>>): void {
    list.forEach((select, index) => select.updateGroupPosition(this.positionForIndex(list, index)));
  }

  private positionForIndex(list: QueryList<SelectComponent<unknown>>, index: number): SelectGroupPosition {
    if (list.length === 1) {
      return SelectGroupPosition.Ungrouped;
    }

    if (index === 0) {
      return SelectGroupPosition.Left;
    }

    if (index === list.length - 1) {
      return SelectGroupPosition.Right;
    }

    return SelectGroupPosition.Center;
  }
}
