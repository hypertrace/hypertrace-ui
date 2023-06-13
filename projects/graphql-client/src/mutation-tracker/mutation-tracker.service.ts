import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MutationTrackerService {
  /**
   * This tracker service assumes that a mutation affects two types of queries.
   *  1. Query for mutated object by ID.
   *  2. List query that contains the mutated object.
   *
   * - Correlation between the object/list is made via the MutationType construct.
   * - Both query/mutation handlers should use the same key for MutationType.
   * - Expects requestTypeOrId to be a Symbol for requests from list queries and string (ID) for individual object queries.
   * - Can be extended to support complex nested query use cases later.
   */

  // Set of objects that has been mutated.
  private mutatedObjects: Set<MutationType> = new Set<MutationType>();

  // Set of queries that has been made against a mutation type since the mutation.
  // Empty set for a mutation type indicates there has been no consumers since last mutation.
  private queriesSinceMutation: Map<MutationType, Set<Symbol | string>> = new Map();

  /** Method to register execution of a mutation action
   *  Actions :
   *  1. Clear the set of consumed queries for a mutation type.
   *  2. Mark an object as affected if an ID is supplied.
   */
  public markMutation(requestType: MutationType, id?: string): void {
    this.queriesSinceMutation.set(requestType, new Set());
    if (id !== undefined) {
      this.mutatedObjects.add(id);
    }
  }

  /** Method to mark a mutation as 'consumed' by a query
   *  Actions :
   *  1. Delete the ID from the affected objects list if ID is given.
   *  2. Add the ID/requestType to the consumed queries set for the mutation type.
   */
  public markMutationAsConsumed(mutationType: MutationType, requestTypeOrId: Symbol | string): void {
    if (!this.isParamSymbol(requestTypeOrId)) {
      this.mutatedObjects.delete(requestTypeOrId as string);
      this.addValueToConsumedSet(mutationType, requestTypeOrId);
    }

    this.addValueToConsumedSet(mutationType, requestTypeOrId);
  }

  private isParamSymbol(param: Symbol | string): boolean {
    return typeof param === 'symbol';
  }

  private addValueToConsumedSet(mutationType: MutationType, value: Symbol | string): void {
    this.queriesSinceMutation.set(mutationType, (this.queriesSinceMutation.get(mutationType) ?? new Set()).add(value));
  }

  /**
   * Method to check if an object/requestType is affected by a mutation.
   * Should return true if a mutation for the type/ID has occurred and this query was not fired earlier since the mutation.
   * 1. If ID is specified, return true if the objects affected list contains the ID and the query was not fired earlier.
   * 2. If requestType is specified, return true if the consumed query list for the mutation type does not contain the requestType
   */
  public isAffectedByMutation(mutationType: MutationType, requestTypeOrId: Symbol | string): boolean {
    if (!this.isParamSymbol(requestTypeOrId)) {
      return (
        !this.queriesSinceMutation.get(mutationType)?.has(requestTypeOrId) &&
        this.mutatedObjects.has(requestTypeOrId as string)
      );
    }

    return !this.queriesSinceMutation.get(mutationType)?.has(requestTypeOrId);
  }
}

type MutationType = string;
