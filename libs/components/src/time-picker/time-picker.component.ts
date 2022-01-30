import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { Time } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';
import { PredefinedTimeService } from '../time-range/predefined-time.service';

@Component({
  selector: 'ht-time-picker',
  styleUrls: ['./time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="time-picker" [ngClass]="{ disabled: this.disabled }">
      <ht-popover class="time-selector" [disabled]="this.disabled" [ngClass]="this.displayMode" [closeOnClick]="true">
        <ht-popover-trigger>
          <div class="popover-trigger" #popoverTrigger>
            <ht-icon
              class="trigger-icon"
              icon="${IconType.Time}"
              size="${IconSize.Large}"
              *ngIf="this.showTimeTriggerIcon"
            ></ht-icon>
            <ht-label class="trigger-label" *ngIf="this.time" [label]="this.time!.label"></ht-label>
            <ht-icon
              class="trigger-caret"
              icon="${IconType.ChevronDown}"
              [size]="
                this.iconSize === '${TimePickerIconSize.Regular}' ? '${IconSize.Small}' : '${IconSize.ExtraSmall}'
              "
            ></ht-icon>
          </div>
        </ht-popover-trigger>
        <ht-popover-content>
          <div class="popover-content" [ngStyle]="{ 'width.px': this.getTimePopoverContentWidth() }">
            <div
              class="popover-item"
              *ngFor="let predefinedTime of this.predefinedTimes"
              (click)="this.onTimeChange(predefinedTime)"
              [ngClass]="{
                selected: this.time && (this.areEqualTimes | htMemoize: this.time:predefinedTime)
              }"
            >
              <span>{{ predefinedTime.label }}</span>
            </div>
          </div>
        </ht-popover-content>
      </ht-popover>
    </div>
  `
})
export class TimePickerComponent {
  @Input()
  public time?: Time;

  @Input()
  public iconSize?: TimePickerIconSize = TimePickerIconSize.Regular;

  @Input()
  public showTimeTriggerIcon?: boolean = false;

  @Input()
  public displayMode?: TimePickerDisplayMode = TimePickerDisplayMode.MenuWithBackground;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly timeChange: EventEmitter<Time> = new EventEmitter();

  @ViewChild('popoverTrigger', { static: true })
  public readonly popoverTrigger!: ElementRef;

  public readonly predefinedTimes: Time[] = this.predefinedTimeService.getPredefinedTimes();

  public constructor(private readonly predefinedTimeService: PredefinedTimeService) {}

  public getTimePopoverContentWidth(): number {
    return (this.popoverTrigger.nativeElement as HTMLElement).offsetWidth;
  }

  public onTimeChange(time: Time): void {
    this.time = time;
    this.timeChange.emit(time);
  }

  public areEqualTimes = (time: Time, predefinedTime: Time) => time.equals(predefinedTime);
}

export const enum TimePickerDisplayMode {
  MenuWithBorder = 'with-border',
  MenuWithBackground = 'with-background'
}

export const enum TimePickerIconSize {
  Small = 'small',
  Regular = 'regular'
}
