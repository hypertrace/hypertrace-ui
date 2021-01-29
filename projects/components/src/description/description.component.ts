import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ht-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./description.component.scss'],
  template: `
    <div class="description">
      <div
        class="description-text"
        [ngClass]="{ 'truncated-text': !this.isDescriptionTextToggled }"
        data-sensitive-pii
        #eventDescription
      >
        {{ description }}
        <span *ngIf="this.isDescriptionTextToggled" (click)="this.toggleDescriptionText()" class="description-button"
          >show less</span
        >
      </div>
      <div
        class="description-button"
        *ngIf="eventDescription.offsetWidth < eventDescription.scrollWidth && !this.isDescriptionTextToggled"
        (click)="this.toggleDescriptionText()"
      >
        show more
      </div>
    </div>
  `
})
export class DescriptionComponent {
  public isDescriptionTextToggled: boolean = false;

  @Input()
  public description!: string;

  public toggleDescriptionText(): void {
    this.isDescriptionTextToggled = !this.isDescriptionTextToggled;
  }
}
