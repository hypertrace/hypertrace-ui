import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList
} from '@angular/core';
import { queryListAndChanges$, SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { merge } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ToggleButtonComponent } from './button/toggle-button.component';
import { ToggleButtonState, ToggleViewMode } from './toggle-button';

@Component({
  selector: 'htc-toggle-button-group',
  styleUrls: ['./toggle-button-group.scss'],
  providers: [SubscriptionLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle-button-group">
      <ng-content select="htc-toggle-button"></ng-content>
    </div>
  `
})
export class ToggleButtonGroupComponent implements OnChanges, AfterViewInit {
  @Input()
  public selectedLabel?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public viewMode: ToggleViewMode = ToggleViewMode.ButtonGroup;

  @Input()
  public disableInitialSelection?: boolean;

  @Output()
  public readonly selectedLabelChange: EventEmitter<string> = new EventEmitter();

  @ContentChildren(ToggleButtonComponent)
  private readonly buttons?: QueryList<ToggleButtonComponent>;

  public constructor(private readonly subscriptionLifeCycle: SubscriptionLifecycle) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.selectedLabel) {
      this.setChildState({ selectedLabel: this.selectedLabel });
    }
    if (changes.disabled) {
      this.setChildState({ isDisabled: this.disabled });
    }
    if (changes.viewMode) {
      this.setChildState({ viewMode: this.viewMode });
    }
  }

  public ngAfterViewInit(): void {
    if (this.buttons) {
      this.subscriptionLifeCycle.add(
        queryListAndChanges$(this.buttons)
          .pipe(
            tap(() => this.setButtonState()),
            switchMap(() => merge<string>(...this.buttons!.map(button => button.labelClick)))
          )
          .subscribe(selectedLabel => this.setSelectionChange(selectedLabel))
      );
    }
  }

  private setButtonState(): void {
    if (this.buttons === undefined || this.buttons.length === 0 || this.disableInitialSelection) {
      return;
    }

    if (this.selectedLabel === undefined) {
      this.selectedLabel = this.buttons.first.label;
    }

    this.buttons.map((button, index) =>
      button.setState({
        isFirst: index === 0,
        isLast: index === this.buttons!.length - 1,
        isDisabled: this.disabled,
        selectedLabel: this.selectedLabel,
        viewMode: this.viewMode
      })
    );
  }

  private setSelectionChange(selectedLabel: string): void {
    if (this.isButtonDisabled(selectedLabel)) {
      return;
    }

    this.selectedLabel = selectedLabel;

    if (this.buttons === undefined) {
      return;
    }

    this.buttons.forEach(button => button.setState({ selectedLabel: selectedLabel }));
    this.selectedLabelChange.emit(selectedLabel);
  }

  private isButtonDisabled(selectedLabel: string): boolean {
    return this.buttons === undefined ? true : this.buttons.find(button => button.label === selectedLabel)!.disabled;
  }

  private setChildState(state: Partial<ToggleButtonState>): void {
    if (this.buttons === undefined) {
      return;
    }
    this.buttons.forEach(button => button.setState(state));
  }
}
