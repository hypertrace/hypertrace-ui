import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild
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
        <ng-content></ng-content>
        {{ description }}
        <span
          *ngIf="isDescriptionTruncated && isDescriptionTextToggled"
          (click)="toggleDescriptionText($event)"
          class="description-button"
          >show less</span
        >
      </div>
      <div
        class="description-button description-button-more"
        *ngIf="isDescriptionTruncated && !isDescriptionTextToggled"
        (click)="toggleDescriptionText($event)"
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

  public constructor(private readonly cdRef: ChangeDetectorRef) {}

  public ngOnChanges(): void {
    if (this.isInitialized) {
      this.remeasure();
    }
  }

  public ngAfterViewInit(): void {
    this.isInitialized = true;
    this.remeasure();
  }

  public toggleDescriptionText(event: Event): void {
    event.stopPropagation();
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
