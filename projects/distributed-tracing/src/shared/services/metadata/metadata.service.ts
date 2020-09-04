import { Injectable } from '@angular/core';
import { forkJoinSafeEmpty, ReplayObservable } from '@hypertrace/common';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { isEmpty, isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, filter, map, shareReplay, tap, throwIfEmpty } from 'rxjs/operators';
import { AttributeMetadata } from '../../graphql/model/metadata/attribute-metadata';
import { addAggregationToDisplayName, getAggregationDisplayName } from '../../graphql/model/metrics/metric-aggregation';
import { Specification } from '../../graphql/model/schema/specifier/specification';
import { isMetricSpecification } from '../../graphql/model/specifications/metric-specification';
import {
  MetadataGraphQlQueryHandlerService,
  METADATA_GQL_REQUEST
} from './handler/metadata-graphql-query-handler.service';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private attributes$?: Observable<AttributeMetadata[]>;

  public constructor(private readonly graphqlQueryService: GraphQlRequestService) {}

  private fetchAttributes(): ReplayObservable<AttributeMetadata[]> {
    this.attributes$ = this.graphqlQueryService
      .queryImmediately<MetadataGraphQlQueryHandlerService>({ requestType: METADATA_GQL_REQUEST })
      .pipe(
        throwIfEmpty(),
        catchError(() => of([])),
        tap(this.sortByDisplayName),
        tap(this.sortSupportedAggregations),
        shareReplay(1)
      );

    return this.attributes$;
  }

  private sortByDisplayName(attributeMetadata: AttributeMetadata[]): void {
    attributeMetadata.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  private sortSupportedAggregations(attributeMetadata: AttributeMetadata[]): void {
    attributeMetadata.forEach(attribute =>
      attribute.allowedAggregations.sort((a, b): number => {
        const displayNameA = getAggregationDisplayName(a);
        const displayNameB = getAggregationDisplayName(b);

        return displayNameA.localeCompare(displayNameB);
      })
    );
  }

  public getFilterAttributes(scope: string): ReplayObservable<AttributeMetadata[]> {
    return this.getServerDefinedAttributes(scope);
  }

  public getSelectionAttributes(scope: string): ReplayObservable<AttributeMetadata[]> {
    return this.getAllAttributes(scope).pipe(
      // Types we can't aggregate we can't select/visualize
      map(attributes => attributes.filter(attribute => attribute.allowedAggregations.length > 0))
    );
  }

  public getGroupableAttributes(scope: string): ReplayObservable<AttributeMetadata[]> {
    return this.getServerDefinedAttributes(scope).pipe(
      // Can only group by strings right now
      map(attributes => attributes.filter(attribute => attribute.groupable))
    );
  }

  public getSpecificationDisplayNameWithUnit(
    scope: string,
    spec: Specification
  ): Observable<{ name: string; units?: string }> {
    return forkJoinSafeEmpty([
      this.getSpecificationDisplayName(scope, spec),
      this.getAttributeKeyUnits(scope, spec.name)
    ]).pipe(
      map(result => ({
        name: result[0],
        units: result[1]
      }))
    );
  }

  public getSpecificationDisplayName(scope: string, spec: Specification): Observable<string> {
    if (!isNil(spec.displayName)) {
      return of(spec.displayName);
    }

    return this.getAttributeKeyDisplayName(scope, spec.name).pipe(
      map(displayName => this.getSpecificationDisplayNameForAttributeDisplayName(spec, displayName))
    );
  }

  public getAttributeKeyDisplayName(scope: string, attributeKey: string): Observable<string> {
    return this.getAttribute(scope, attributeKey).pipe(
      map(attribute => this.getAttributeDisplayName(attribute)),
      defaultIfEmpty(attributeKey) // Defaults to key if attribute not known. Should it error?
    );
  }

  public getAttributeKeyUnits(scope: string, attributeKey: string): Observable<string> {
    return this.getAttribute(scope, attributeKey).pipe(
      map(attribute => attribute.units),
      defaultIfEmpty('')
    );
  }

  public getAttribute(scope: string, attributeKey: string): Observable<AttributeMetadata> {
    return this.getAllAttributes(scope).pipe(
      map(attributes => attributes.find(attribute => attribute.name === attributeKey)),
      filter((maybeAttribute): maybeAttribute is AttributeMetadata => maybeAttribute !== undefined)
    );
  }

  public getAttributeDisplayName(attribute: AttributeMetadata): string {
    return !isEmpty(attribute.displayName) ? attribute.displayName : attribute.name;
  }

  private getServerDefinedAttributes(scope: string): ReplayObservable<AttributeMetadata[]> {
    return (this.attributes$ || this.fetchAttributes()).pipe(
      map(attributes => attributes.filter(attribute => this.matchesScopes(attribute, [scope])))
    );
  }

  private getAllAttributes(scope: string): ReplayObservable<AttributeMetadata[]> {
    return this.getServerDefinedAttributes(scope);
  }

  private matchesScopes(attributeMetadata: AttributeMetadata, scopes: string[]): boolean {
    return scopes.some(scope => scope === attributeMetadata.scope);
  }

  private getSpecificationDisplayNameForAttributeDisplayName(spec: Specification, displayName: string): string {
    if (isMetricSpecification(spec)) {
      return addAggregationToDisplayName(displayName, spec.aggregation);
    }

    return displayName;
  }
}
