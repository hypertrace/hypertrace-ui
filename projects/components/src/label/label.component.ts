import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'htc-label',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      (htcLayoutChange)="this.remeasure()"
      [attr.aria-label]="label"
      [ngClass]="{ truncate: !this.wrap, 'no-label': this.isNoLabel() }"
      [htcTooltip]="this.showTooltip() ? label : ''"
    >
      {{ this.isNoLabel() ? 'no-label' : label }}
    </div>
  `
})
export class LabelComponent implements OnChanges, AfterViewInit {
  /*
   * There is a potential for poor performance here. Accessing offsetWidth below causes the browser to calculate that
   * value on read. If calling that function in the DOM binding for [htcTooltip] that read happens every change
   * detection cycle.
   *
   * This means that when the window resizes, every label remeasures. It also means that any event causes a remeasure.
   * For instance when hovering the label. One of these two remeasures is desired, but not both.
   *
   * To eliminate the remeasure on the hover we are using (htcLayoutChange) to only measure when a resize event
   * happens.
   *
   * Then, instead of remeasuring in showTooltip(), we will just access the precalculated (on resize) value.
   */
  @Input()
  public label?: string | number;

  @Input()
  public wrap: boolean = false;

  @Input()
  public tooltipOnlyOnTruncated: boolean = true;

  private isInitialized: boolean = false;
  private isTruncated: boolean = false;

  public constructor(private readonly element: ElementRef) {}

  public ngOnChanges(): void {
    if (this.isInitialized) {
      this.remeasure();
    }
  }

  public isNoLabel(): boolean {
    /*
     * If there is no label provided we still want to maintain the area in the DOM that would normally
     * be occupied by the label, so lets create one above in the template, but set its opacity to 0
     */
    return this.label === undefined || this.label === '';
  }

  public ngAfterViewInit(): void {
    this.remeasure();
    this.isInitialized = true;
  }

  public remeasure(): void {
    this.isTruncated =
      this.element.nativeElement.children[0].offsetWidth < this.element.nativeElement.children[0].scrollWidth;
  }

  public showTooltip(): boolean {
    return this.tooltipOnlyOnTruncated ? this.isTruncated : true;
  }
}
