import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  OnChanges,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'ht-description',
  styleUrls: ['./description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="description" (htLayoutChange)="this.remeasure()" #eventDescriptionContainer>
      <div
        class="description-text"
        [ngClass]="{ 'truncated-text': !isDescriptionTextToggled }"
        data-sensitive-pii
        #eventDescriptionText
      >
        {{ description }}
        <span
          *ngIf="isDescriptionTruncated && isDescriptionTextToggled"
          (click)="toggleDescriptionText()"
          class="description-button"
          >show less</span
        >
      </div>
      <div
        class="description-button description-button-more"
        *ngIf="isDescriptionTruncated && !isDescriptionTextToggled"
        (click)="toggleDescriptionText()"
      >
        show more
      </div>
    </div>
  `
})
export class DescriptionComponent implements OnChanges, AfterViewInit {
  public isInitialized: boolean = false;
  public isDescriptionTextToggled: boolean = false;
  public isDescriptionTruncated!: boolean;

  @ViewChild('eventDescriptionText', { read: ElementRef })
  public readonly eventDescriptionText!: ElementRef;

  @ViewChild('eventDescriptionContainer', { read: ElementRef })
  public readonly eventDescriptionContainer!: ElementRef;

  @Input()
  public description!: string;

  constructor(private readonly cdRef: ChangeDetectorRef) {}

  public ngOnChanges(): void {
    if (this.isInitialized) {
      this.remeasure();
    }
  }

  ngAfterViewInit() {
    this.isInitialized = true;
    this.remeasure();
  }

  public toggleDescriptionText(): void {
    this.isDescriptionTextToggled = !this.isDescriptionTextToggled;
  }

  public remeasure(): void {
    this.isDescriptionTextToggled = false;
    this.cdRef.detectChanges();

    this.isDescriptionTruncated =
      this.eventDescriptionContainer.nativeElement.offsetWidth < this.eventDescriptionText.nativeElement.scrollWidth;
    this.cdRef.detectChanges();
  }
}
