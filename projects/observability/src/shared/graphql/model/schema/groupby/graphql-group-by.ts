import { AttributeExpression } from '../../attribute/attribute-expression';

export interface GraphQlGroupBy {
  keyExpressions: AttributeExpression[];
  includeRest?: boolean;
  limit: number;
}
