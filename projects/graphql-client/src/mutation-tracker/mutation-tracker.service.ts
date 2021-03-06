import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MutationTrackerService {
  /**
   This tracker service assumes that a mutation affects two types of queries.
   1. Query by ID for the mutated object.
   2. List query that contains the mutated object.

   A separate mutation type is introduced so that the mutation handler and query handler can stay independent.

   Currently does not support refreshing composite nested queries.
   */

  private mutationTypesAffected: Set<MutationType> = new Set<MutationType>();
  private objectsAffected: Set<string> = new Set<string>();

  // When an action is marked as executed, clear the set
  public markMutation(requestType: MutationType, id?: string): void {
    console.log(`Marking ${requestType}, ${id} as mutated`);
    this.mutationTypesAffected.add(requestType);
    if (id !== undefined) {
      this.objectsAffected.add(id);
    }
  }

  public markMutationAsConsumedByIdQuery(id: string): void {
    console.log(`Consumed ${id}`);
    this.objectsAffected.delete(id);
  }

  public markMutationAsConsumedByListQuery(mutationType: MutationType): void {
    console.log(`Consumed ${mutationType}`);
    this.mutationTypesAffected.delete(mutationType);
  }

  public isAffectedByMutation(requestType: MutationType, id?: string): boolean {
    if (id !== undefined) {
      return this.mutationTypesAffected.has(requestType) && this.objectsAffected.has(id);
    }

    return this.mutationTypesAffected.has(requestType);
  }
}

export enum MutationType {
  Entity = 'entity'
}
