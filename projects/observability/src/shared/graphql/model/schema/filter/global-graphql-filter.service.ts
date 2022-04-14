import { Injectable } from '@angular/core';
import { GraphQlFilter } from './graphql-filter';

@Injectable({ providedIn: 'root' })
export class GlobalGraphQlFilterService {
  private readonly filterRules: Map<symbol, FilterRule> = new Map();

  public getGlobalFilters(scope: string): GraphQlFilter[] {
    return Array.from(this.filterRules.values()).flatMap(rule => rule.filtersForScope(scope));
  }

  public mergeGlobalFilters(scope: string, localFilters: GraphQlFilter[] = []): GraphQlFilter[] {
    return [...localFilters, ...this.getGlobalFilters(scope)];
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
