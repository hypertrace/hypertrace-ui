import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InputAppearance } from '@hypertrace/components';

@Component({
  selector: 'ht-explore-query-limit-editor',
  styleUrls: ['./explore-query-limit-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="limit-container">
      <div class="limit-number-input-container">
        <span class="limit-label"> Max Groups </span>
        <div class="limit-input-wrapper">
          <ht-input
            type="number"
            class="limit-input"
            appearance="${InputAppearance.Border}"
            [value]="this.limit"
            (valueChange)="this.limitChange.emit($event)"
          >
          </ht-input>
        </div>
      </div>
      <div class="limit-include-rest-container">
        <span class="limit-include-rest-label"> Show Other: </span>
        <ht-checkbox [checked]="this.includeRest" (checkedChange)="this.includeRestChange.emit($event)"> </ht-checkbox>
      </div>
    </div>
  `
})
export class ExploreQueryLimitEditorComponent {
  @Input()
  public limit: number = 1;

  @Input()
  public includeRest: boolean = false;

  @Output()
  public readonly limitChange: EventEmitter<number> = new EventEmitter();

  @Output()
  public readonly includeRestChange: EventEmitter<boolean> = new EventEmitter();
}
