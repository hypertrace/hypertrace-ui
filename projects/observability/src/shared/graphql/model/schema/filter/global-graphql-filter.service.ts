import { Injectable } from '@angular/core';
import { GraphQlFilter } from './graphql-filter';

@Injectable({ providedIn: 'root' })
export class GlobalGraphQlFilterService {
  private readonly filterRules: Map<symbol, FilterRule> = new Map();

  public getGlobalFilters(scope: string, filtersToExclude: symbol[] = []): GraphQlFilter[] {
    const filtersToExcludeSet = new Set(filtersToExclude);

    return Array.from(this.filterRules.entries())
      .reduce((acc, curr) => {
        const [ruleKey, rule] = curr;
        if (!filtersToExcludeSet.has(ruleKey)) {
          acc.push(rule);
        }

        return acc;
      }, [] as FilterRule[])
      .flatMap(rule => rule.filtersForScope(scope));
  }

  public mergeGlobalFilters(
    scope: string,
    localFilters: GraphQlFilter[] = [],
    filtersToExclude: symbol[] = []
  ): GraphQlFilter[] {
    return [...localFilters, ...this.getGlobalFilters(scope, filtersToExclude)];
  }

  public setGlobalFilterRule(ruleKey: symbol, rule: FilterRule): void {
    this.filterRules.set(ruleKey, rule);
  }

  public clearGlobalFilterRule(ruleKey: symbol): void {
    this.filterRules.delete(ruleKey);
  }
}

interface FilterRule {
  filtersForScope(scope: string): GraphQlFilter[];
}
