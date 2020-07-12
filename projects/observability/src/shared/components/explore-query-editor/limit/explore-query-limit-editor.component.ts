import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { InputAppearance } from '@hypertrace/components';

@Component({
  selector: 'ht-explore-query-limit-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./explore-query-limit-editor.component.scss'],
  template: `
    <div class="limit-container">
      <div class="limit-number-input-container">
        <span class="limit-label" [ngClass]="{ disabled: this.disabled }">
          Max Results
        </span>
        <div class="limit-input-wrapper">
          <htc-input
            [type]="this.getInputType()"
            class="limit-input"
            appearance="${InputAppearance.Border}"
            [disabled]="this.disabled"
            [value]="this.getLimitValue()"
            (valueChange)="this.limitChange.emit($event)"
          >
          </htc-input>
        </div>
      </div>
      <div class="limit-include-rest-container" *ngIf="!this.disabled">
        <span class="limit-include-rest-label">
          Group other results:
        </span>
        <htc-checkbox
          [disabled]="this.disabled"
          [checked]="this.includeRest"
          (checkedChange)="this.includeRestChange.emit($event)"
        >
        </htc-checkbox>
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
