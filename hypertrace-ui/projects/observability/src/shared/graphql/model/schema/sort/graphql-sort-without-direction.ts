import { DistributiveOmit } from '@hypertrace/common';
import { GraphQlSortArgument } from './graphql-sort-argument';

export type GraphQlSortWithoutDirection = DistributiveOmit<GraphQlSortArgument, 'direction'>;
