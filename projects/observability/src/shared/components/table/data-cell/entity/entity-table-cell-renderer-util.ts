import { Dictionary } from '@hypertrace/common';
import { TableRow } from '@hypertrace/components';
import { MetricAggregation } from '@hypertrace/distributed-tracing';
import { isNumber } from 'lodash-es';
import { Entity, Interaction } from '../../../../graphql/model/schema/entity';
import { EntitySpecificationBuilder } from '../../../../graphql/request/builders/specification/entity/entity-specification-builder';

export const parseEntityFromTableRow = (cell: Entity | undefined, row: Dictionary<unknown>): Entity | undefined => {
  if (cell === undefined && isInteraction(row.neighbor)) {
    /*
     * TODO: This is a temporary hack. It might be better if the GraphQL spec builder provided a way for downstream
     *  code to path into the the data consistently with resultAlias or another similar method, but I want to limit
     *  the scope of this PR.
     *
     * For now we can assume if a cell value is undefined its because the Entity is part of an Interaction and
     *  therefore provided under a "neighbor" key in the json.
     *
     * Note that 'id' and 'name' come from the default values in EntitySpecificationModel, which in the case
     *  of an Interaction, never get reassigned.
     *
     * Lots of assumptions here, so this code needs to be fixed. Its brittle. It is, however, fairly isolated and
     *  will gracefully fail by providing undefined the same way it would have if cell was undefined anyway.
     */
    const resultAlias = new EntitySpecificationBuilder().buildResultAlias('id', 'name');

    return row.neighbor[resultAlias] as Entity | undefined;
  }

  return cell;
};

const isInteraction = (neighbor: unknown): neighbor is Interaction => typeof neighbor === 'object';

export const isInactiveEntity = (row: TableRow): boolean | undefined => {
  const maxEndTimeAggregation = row['max(endTime)']; // Ew.

  if (!includesMaxEndTimeAggregation(maxEndTimeAggregation)) {
    // If the aggregation wasn't fetched, we have no way of knowing if this Entity is inactive.
    return undefined;
  }

  return !hasValidMaxEndTimeTimestamp(maxEndTimeAggregation.value);
};

const includesMaxEndTimeAggregation = (maxEndTimeAggregation?: unknown): maxEndTimeAggregation is MetricAggregation =>
  maxEndTimeAggregation !== undefined;

const hasValidMaxEndTimeTimestamp = (maxEndTime?: unknown): maxEndTime is number =>
  maxEndTime !== undefined && isNumber(maxEndTime);
