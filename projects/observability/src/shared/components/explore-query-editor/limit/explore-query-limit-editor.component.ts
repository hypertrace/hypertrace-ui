import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InputAppearance } from '@hypertrace/components';

@Component({
  selector: 'ht-explore-query-limit-editor',
  styleUrls: ['./explore-query-limit-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="limit-container">
      <div class="limit-number-input-container">
        <span class="limit-label" [ngClass]="{ disabled: this.disabled }">
          Max Results
        </span>
        <div class="limit-input-wrapper">
          <ht-input
            [type]="this.getInputType()"
            class="limit-input"
            appearance="${InputAppearance.Border}"
            [disabled]="this.disabled"
            [value]="this.getLimitValue()"
            (valueChange)="this.limitChange.emit($event)"
          >
          </ht-input>
        </div>
      </div>
      <div class="limit-include-rest-container" *ngIf="!this.disabled">
        <span class="limit-include-rest-label">
          Show Other:
        </span>
        <ht-checkbox
          [disabled]="this.disabled"
          [checked]="this.includeRest"
          (checkedChange)="this.includeRestChange.emit($event)"
        >
        </ht-checkbox>
      </div>
    </div>
  `
})
export class ExploreQueryLimitEditorComponent {
  @Input()
  public limit: number = 1;

  @Input()
  public includeRest: boolean = false;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly limitChange: EventEmitter<number> = new EventEmitter();

  @Output()
  public readonly includeRestChange: EventEmitter<boolean> = new EventEmitter();

  public getInputType(): string {
    return this.disabled ? 'text' : 'number';
  }

  public getLimitValue(): string | number {
    return this.disabled ? 'Auto' : this.limit;
  }
}
