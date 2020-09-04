import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { IconSize } from '../../icon/icon-size';
import { ToggleButtonState, ToggleViewMode } from '../toggle-button';

@Component({
  selector: 'htc-toggle-button',
  styleUrls: ['./toggle-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="htc-toggle-button"
      [ngClass]="{
        'button-view-mode': this.state.viewMode === '${ToggleViewMode.Button}',
        'button-group-view-mode': this.state.viewMode === '${ToggleViewMode.ButtonGroup}',
        'text-view-mode': this.state.viewMode === '${ToggleViewMode.Text}'
      }"
      (click)="this.onSelection()"
    >
      <button
        [disabled]="this.state.isDisabled || this.disabled"
        class="button"
        [ngClass]="{
          selected: this.label === this.state.selectedLabel,
          first: this.state.isFirst,
          last: this.state.isLast,
          disabled: this.state.isDisabled || this.disabled
        }"
      >
        <div class="center-contents">
          <htc-icon
            *ngIf="this.showIcon"
            [icon]="this.icon"
            [label]="this.label"
            [size]="this.iconSize"
            class="center-contents button-icon"
          ></htc-icon>
          <htc-label *ngIf="this.showLabel" [label]="this.label" class="label"></htc-label>
        </div>
        <ng-content></ng-content>
      </button>
    </div>
  `
})
export class ToggleButtonComponent implements OnInit {
  @Input()
  public label!: string;

  @Input()
  public icon: IconType | undefined;

  @Input()
  public iconSize: IconSize = IconSize.Medium;

  @Input()
  public showIcon: boolean | undefined;

  @Input()
  public showLabel: boolean = true;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly labelClick: EventEmitter<string> = new EventEmitter();

  public readonly state: ToggleButtonState = {
    isFirst: false,
    isLast: false,
    isDisabled: false,
    selectedLabel: '',
    viewMode: ToggleViewMode.Button
  };

  public constructor(private readonly changeDetector: ChangeDetectorRef) {}

  public ngOnInit(): void {
    if (this.icon !== undefined && this.showIcon === undefined) {
      this.showIcon = true;
    }
  }

  public setState(state: Partial<ToggleButtonState>): void {
    Object.assign(this.state, state);
    this.changeDetector.detectChanges();
  }

  public onSelection(): void {
    this.labelClick.emit(this.label);
  }
}
