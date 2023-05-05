import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { sortUnknown } from '@hypertrace/common';
import { ButtonVariant } from '../../button/button';
import { ModalRef, MODAL_DATA } from '../../modal/modal';
import { FilterBuilderLookupService } from '../filter/builder/filter-builder-lookup.service';
import { FilterValue, IncompleteFilter } from '../filter/filter';
import { FilterAttribute } from '../filter/filter-attribute';
import { FilterOperator } from '../filter/filter-operators';
import { FilterUrlService } from '../filter/filter-url.service';

@Component({
  selector: 'ht-in-filter-modal',
  styleUrls: ['./in-filter-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-modal">
      <div class="value-items">
        <div class="value-item" *ngFor="let availableValue of this.modalData.values">
          <ht-checkbox
            [label]="availableValue"
            [checked]="this.selected.has(availableValue)"
            (checkedChange)="this.onChecked($event, availableValue)"
          ></ht-checkbox>
        </div>
      </div>

      <div class="controls">
        <ht-button
          label="Cancel"
          class="cancel-button"
          variant="${ButtonVariant.Tertiary}"
          (click)="this.onCancel()"
        ></ht-button>
        <ht-button
          label="Apply"
          class="action-button"
          variant="${ButtonVariant.Additive}"
          (click)="this.onApply()"
        ></ht-button>
      </div>
    </div>
  `
})
export class InFilterModalComponent {
  public isSupported: boolean = false;
  public selected: Set<FilterValue> = new Set<FilterValue>();

  public constructor(
    private readonly modalRef: ModalRef<never>,
    @Inject(MODAL_DATA) public readonly modalData: InFilterModalData,
    private readonly filterUrlService: FilterUrlService,
    private readonly filterBuilderLookupService: FilterBuilderLookupService
  ) {
    this.getCurrentValues();
  }

  private getCurrentValues(): void {
    this.selected.clear();

    this.filterUrlService
      .getUrlFilters([this.modalData.attribute])
      .filter(filter => filter.operator === FilterOperator.In)
      .forEach(filter => {
        if (filter.value instanceof Array) {
          filter.value.forEach(value => this.selected.add(value));
        } else {
          this.selected.add(filter.value);
        }
      });
  }

  public onApply(): void {
    const filter = this.filterBuilderLookupService
      .lookup(this.modalData.attribute.type)
      .buildFilter(this.modalData.attribute, FilterOperator.In, [...this.selected.values()].sort(sortUnknown));

    if (this.selected.size > 0) {
      this.filterUrlService.addUrlFilter(this.modalData.metadata, filter);
    } else {
      const incompleteFilter: IncompleteFilter = {
        ...filter,
        value: undefined
      };
      this.filterUrlService.removeUrlFilter(this.modalData.metadata, incompleteFilter);
    }

    this.modalRef.close();
  }

  public onCancel(): void {
    this.modalRef.close();
  }

  public onChecked(checked: boolean, value: FilterValue): void {
    checked ? this.selected.add(value) : this.selected.delete(value);
  }
}

export interface InFilterModalData {
  metadata: FilterAttribute[];
  attribute: FilterAttribute;
  values: unknown[];
}
