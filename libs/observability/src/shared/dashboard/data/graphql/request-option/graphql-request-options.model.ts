import { BOOLEAN_PROPERTY, Model, ModelProperty } from '@hypertrace/hyperdash';

import { EnumPropertyTypeInstance, ENUM_TYPE } from '@hypertrace/dashboards';
import { GraphQlRequestCacheability } from '@hypertrace/graphql-client';

@Model({
  type: 'request-options'
})
export class GraphQlRequestOptionsModel {
  @ModelProperty({
    key: 'cacheability',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        GraphQlRequestCacheability.NotCacheable,
        GraphQlRequestCacheability.RefreshCache,
        GraphQlRequestCacheability.Cacheable
      ]
    } as EnumPropertyTypeInstance
  })
  public cacheability?: GraphQlRequestCacheability;

  @ModelProperty({
    key: 'isolated',
    type: BOOLEAN_PROPERTY.type
  })
  public isolated?: boolean;
}
