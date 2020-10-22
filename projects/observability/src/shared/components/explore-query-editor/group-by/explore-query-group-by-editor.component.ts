import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { SelectOption } from '@hypertrace/components';
import { MetadataService, TraceType } from '@hypertrace/distributed-tracing';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'ht-explore-query-group-by-editor',
  styleUrls: ['./explore-query-group-by-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group-by-container">
      <span class="group-by-label"> Group By </span>
      <ht-select
        *ngIf="this.groupByKeyOptions$ | async as keyOptions"
        [showBorder]="true"
        class="group-by-selector"
        [selected]="this.groupByKey$ | async"
        (selectedChange)="this.onGroupByKeyChange($event)"
      >
        <ht-select-option
          *ngFor="let option of keyOptions"
          [value]="option.value"
          [label]="option.label"
        ></ht-select-option>
      </ht-select>
    </div>
  `
})
export class ExploreQueryGroupByEditorComponent implements OnChanges {
  @Input()
  public groupByKey?: string;

  @Input()
  public context?: TraceType;

  @Output()
  public readonly groupByKeyChange: EventEmitter<string | undefined> = new EventEmitter();

  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);
  private readonly incomingGroupByKeySubject: Subject<string | undefined> = new ReplaySubject(1);

  public readonly groupByKey$: Observable<string | undefined>;
  public readonly groupByKeyOptions$: Observable<SelectOption<string | undefined>[]>;

  public constructor(private readonly metadataService: MetadataService) {
    this.groupByKeyOptions$ = this.contextSubject.pipe(switchMap(context => this.getGroupByOptionsForContext(context)));

    this.groupByKey$ = combineLatest([this.groupByKeyOptions$, this.incomingGroupByKeySubject]).pipe(
      map(optionsAndKey => this.resolveKeyFromOptions(...optionsAndKey))
    );
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }

    if (changeObject.groupByKey) {
      this.incomingGroupByKeySubject.next(this.groupByKey);
    }
  }

  public onGroupByKeyChange(newKey?: string): void {
    this.groupByKeyChange.emit(newKey);
  }

  private resolveKeyFromOptions(options: SelectOption<string | undefined>[], key?: string): string | undefined {
    if (key !== undefined && options.find(option => option.value === key)) {
      return key;
    }

    return undefined;
  }

  private getGroupByOptionsForContext(context?: TraceType): Observable<SelectOption<string | undefined>[]> {
    if (context === undefined) {
      return of([this.getEmptyGroupByOption()]);
    }

    return this.metadataService.getGroupableAttributes(context).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          value: attribute.name,
          label: this.metadataService.getAttributeDisplayName(attribute)
        }))
      ),
      map(attributeOptions => [this.getEmptyGroupByOption(), ...attributeOptions])
    );
  }

  private getEmptyGroupByOption(): SelectOption<string | undefined> {
    return {
      value: undefined,
      label: 'None'
    };
  }
}
