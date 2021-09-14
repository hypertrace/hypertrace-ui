import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-score-bar',
  styleUrls: ['./score-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="score-bar" #scoreBarContainer>
      <div *ngIf="this.isSingleBarDisplay; else pillScoreBar" class="continuous">
        <div class="fill" [ngStyle]="{ width: this.fillWidth, backgroundColor: this.fillColor }"></div>
      </div>

      <ng-template #pillScoreBar>
        <div class="pills">
          <div
            *ngFor="let pill of this.pills; index as index"
            class="pill"
            [htTooltip]="pill.value"
            [ngStyle]="{ backgroundColor: pill.color, width: this.pillWidth }"
          ></div>
        </div>
      </ng-template>
    </div>
  `
})
export class ScoreBarComponent implements OnChanges, AfterViewInit {
  @Input()
  // Max is required if valueType is AbsoluteValue
  public max?: number;

  @Input()
  public value!: number;

  @Input()
  public valueType: ScoreBarValueType = ScoreBarValueType.Percentage;

  @Input()
  public displayType: ScoreBarDisplayType = ScoreBarDisplayType.Single;

  @Input()
  public fillColor: Color = Color.Gray3;

  @ViewChild('scoreBarContainer', { read: ElementRef })
  public readonly progressBarContainer!: ElementRef;

  public isSingleBarDisplay: boolean = true;
  public fillWidth: string = '100%';
  public pills: PillData[] = [];
  public pillWidth: string = '14px';

  public ngOnChanges(): void {
    this.isSingleBarDisplay = this.displayType === ScoreBarDisplayType.Single;

    if (this.isSingleBarDisplay) {
      this.fillWidth = this.computeWidth();
    } else {
      this.pills = this.createPills();
    }
  }

  public ngAfterViewInit(): void {
    if (this.displayType === ScoreBarDisplayType.Pill) {
      this.pillWidth = `${
        ((this.progressBarContainer.nativeElement.offsetWidth as number) - (this.max! - 1) * 3) / this.max!
      }px`;
    }
  }

  private computeWidth(): string {
    if (this.valueType === ScoreBarValueType.Percentage) {
      return `${this.value}%`;
    }

    return `${(this.value / this.max!) * 100}%`;
  }

  private createPills(): PillData[] {
    // Pill view do not support percentage values yet.
    return [...Array(this.max!).keys()].map(key => ({
      color: key < this.value ? this.fillColor : Color.Gray1,
      value: key + 1
    }));
  }
}

export const enum ScoreBarValueType {
  Percentage = 'percentage',
  // If type is absolute, max is required
  Absolute = 'absolute'
}

export const enum ScoreBarDisplayType {
  Single = 'single',
  // If display type is pill, valueType has to be absoluteValue
  Pill = 'pill'
}

export interface PillData {
  color: Color;
  value: number | string;
}
