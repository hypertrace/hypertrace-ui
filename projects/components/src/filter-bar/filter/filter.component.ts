import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { ComboBoxMode, ComboBoxOption, ComboBoxResult } from '../../combo-box/combo-box-api';
import { FilterAttribute } from '../filter-attribute';
import { Filter } from './filter-api';
import { FilterService, IncompleteFilter } from './filter.service';

@Component({
  selector: 'ht-filter',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter">
      <ht-combo-box
        class="combo-box"
        mode="${ComboBoxMode.Chip}"
        [exactMatch]="false"
        [autoSize]="this.text !== undefined"
        [text]="this.text"
        [options]="this.options"
        (textChange)="this.onTextChange($event)"
        (enter)="this.onApply($event)"
        (selection)="this.onApply($event)"
        (clear)="this.onClear()"
        (escape)="this.onClear()"
      ></ht-combo-box>
    </div>
  `
})
export class FilterComponent implements OnInit, OnChanges {
  @Input()
  public attributes?: FilterAttribute[];

  @Input()
  public filter?: Filter;

  @Input()
  public clearOnEnter?: boolean = false;

  @Output()
  public readonly apply: EventEmitter<Filter> = new EventEmitter();

  @Output()
  public readonly clear: EventEmitter<void> = new EventEmitter();

  public text?: string;
  public options?: ComboBoxOption<IncompleteFilter>[];

  public constructor(private readonly filterService: FilterService) {}

  public ngOnInit(): void {
    this.onFilterChange();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.filter || changes.attributes) {
      this.onFilterChange();
    }
  }

  public onFilterChange(): void {
    this.text = this.filter && this.filter.userString;
    this.options = this.setOptions();
  }

  public onTextChange(text: string | undefined): void {
    this.text = text;
    this.options = this.setOptions();
  }

  public onApply(result: ComboBoxResult<IncompleteFilter>): void {
    if (!this.isValidFilter(result)) {
      return;
    }

    this.apply.emit(result.option!.value);

    if (this.clearOnEnter) {
      this.filter = undefined;
      this.onFilterChange();
    }
  }

  public onClear(): void {
    this.onTextChange(undefined);
    this.clear.emit();
  }

  private isValidFilter(result: ComboBoxResult<IncompleteFilter>): result is ComboBoxResult<Filter> {
    return result.option?.value !== undefined && result.option?.value.value !== undefined;
  }

  private setOptions(): ComboBoxOption<IncompleteFilter>[] {
    return !this.attributes
      ? []
      : this.mapToComboBoxOptions(this.filterService.lookupAvailableMatchingFilters(this.attributes, this.text));
  }

  private mapToComboBoxOptions(filters: IncompleteFilter[]): ComboBoxOption<IncompleteFilter>[] {
    return filters.map(filter => this.mapToComboBoxOption(filter));
  }

  private mapToComboBoxOption(filter: IncompleteFilter): ComboBoxOption<IncompleteFilter> {
    return {
      text: filter.userString,
      value: filter,
      tooltip: `${filter.userString} (${filter.field})`
    };
  }
}
