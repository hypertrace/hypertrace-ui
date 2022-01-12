import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TypedSimpleChanges } from '@hypertrace/common';
import { InputAppearance, SelectOption } from '@hypertrace/components';
import { isEmpty, isNil, omit } from 'lodash-es';
import { combineLatest, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { AttributeExpression } from '../../../graphql/model/attribute/attribute-expression';
import { AttributeMetadata, AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import { TraceType } from '../../../graphql/model/schema/trace';
import { MetadataService } from '../../../services/metadata/metadata.service';
@Component({
  selector: 'ht-explore-query-group-by-editor',
  styleUrls: ['./explore-query-group-by-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group-by-container" *htLetAsync="this.currentGroupByExpression$ as currentGroupByExpression">
      <div class="group-by-input-container">
        <span class="group-by-label"> Group By </span>
        <ht-select
          *ngIf="this.groupByAttributeOptions$ | async as attributeOptions"
          [showBorder]="true"
          class="group-by-selector"
          [selected]="currentGroupByExpression && currentGroupByExpression.metadata"
          (selectedChange)="this.onGroupByAttributeChange($event)"
        >
          <ht-select-option
            *ngFor="let option of attributeOptions"
            [value]="option.value"
            [label]="option.label"
          ></ht-select-option>
        </ht-select>
      </div>
      <div class="group-by-input-container" *ngIf="this.supportsSubpath(currentGroupByExpression?.metadata)">
        <span class="group-by-label"> {{ currentGroupByExpression.metadata.displayName }} Key </span>
        <div class="group-by-path-wrapper">
          <ht-form-field
            errorLabel="Key required"
            [showBorder]="true"
            [showFormError]="!currentGroupByExpression.subpath"
          >
            <ht-input
              type="string"
              class="group-by-path-input"
              appearance="${InputAppearance.Border}"
              [value]="currentGroupByExpression.subpath"
              (valueChange)="this.onGroupBySubpathChange(currentGroupByExpression, $event)"
            >
            </ht-input>
          </ht-form-field>
        </div>
      </div>
    </div>
  `
})
export class ExploreQueryGroupByEditorComponent implements OnChanges {
  @Input()
  public groupByExpression?: AttributeExpression;

  @Input()
  public context?: TraceType;

  @Output()
  public readonly groupByExpressionChange: EventEmitter<AttributeExpression | undefined> = new EventEmitter();

  private readonly contextSubject: Subject<TraceType | undefined> = new ReplaySubject(1);
  private readonly incomingGroupByExpressionSubject: Subject<AttributeExpression | undefined> = new ReplaySubject(1);
  private readonly groupByExpressionsToEmit: Subject<AttributeExpressionWithMetadata | undefined> = new Subject();

  public readonly currentGroupByExpression$: Observable<AttributeExpressionWithMetadata | undefined>;
  public readonly groupByAttributeOptions$: Observable<SelectOption<AttributeMetadata | undefined>[]>;

  public constructor(private readonly metadataService: MetadataService) {
    this.groupByAttributeOptions$ = this.contextSubject.pipe(
      switchMap(context => this.getGroupByOptionsForContext(context))
    );

    this.currentGroupByExpression$ = combineLatest([
      this.groupByAttributeOptions$,
      merge(this.incomingGroupByExpressionSubject, this.groupByExpressionsToEmit)
    ]).pipe(map(optionsAndKey => this.resolveAttributeFromOptions(...optionsAndKey)));

    this.groupByExpressionsToEmit
      .pipe(
        filter(expression => this.isValidExpressionToEmit(expression)),
        debounceTime(500),
        map(expression => omit(expression, 'metadata'))
      )
      .subscribe(this.groupByExpressionChange);
  }

  public ngOnChanges(changeObject: TypedSimpleChanges<this>): void {
    if (changeObject.context) {
      this.contextSubject.next(this.context);
    }

    if (changeObject.groupByExpression) {
      this.incomingGroupByExpressionSubject.next(this.groupByExpression);
    }
  }

  public onGroupByAttributeChange(newAttribute?: AttributeMetadata): void {
    this.groupByExpressionsToEmit.next(newAttribute && { key: newAttribute.name, metadata: newAttribute });
  }

  public onGroupBySubpathChange(previousExpression: AttributeExpressionWithMetadata, newPath: string): void {
    this.groupByExpressionsToEmit.next({ ...previousExpression, subpath: newPath });
  }

  public supportsSubpath(attribute?: AttributeMetadata): boolean {
    return attribute?.type === AttributeMetadataType.StringMap;
  }

  private resolveAttributeFromOptions(
    options: SelectOption<AttributeMetadata | undefined>[],
    expression?: AttributeExpression
  ): AttributeExpressionWithMetadata | undefined {
    if (isNil(expression)) {
      return undefined;
    }

    const metadata = options.find(option => option.value?.name === expression.key)?.value;

    return metadata && { ...expression, metadata: metadata };
  }

  private getGroupByOptionsForContext(context?: TraceType): Observable<SelectOption<AttributeMetadata | undefined>[]> {
    if (context === undefined) {
      return of([this.getEmptyGroupByOption()]);
    }

    return this.metadataService.getGroupableAttributes(context).pipe(
      map(attributes =>
        attributes.map(attribute => ({
          value: attribute,
          label: this.metadataService.getAttributeDisplayName(attribute)
        }))
      ),
      map(attributeOptions => [this.getEmptyGroupByOption(), ...attributeOptions])
    );
  }

  private getEmptyGroupByOption(): SelectOption<AttributeMetadata | undefined> {
    return {
      value: undefined,
      label: 'None'
    };
  }

  private isValidExpressionToEmit(expressionToTest?: AttributeExpressionWithMetadata): boolean {
    // Can't attept to group by a map attribute without a subpath, so we treat that state as invalid and don't emit
    return !(this.supportsSubpath(expressionToTest?.metadata) && isEmpty(expressionToTest?.subpath));
  }
}

interface AttributeExpressionWithMetadata extends AttributeExpression {
  metadata: AttributeMetadata;
}
