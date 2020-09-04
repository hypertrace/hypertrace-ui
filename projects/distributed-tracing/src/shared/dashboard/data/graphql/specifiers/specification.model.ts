import { GraphQlSelection } from '@hypertrace/graphql-client';
import { ModelOnInit, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { GraphQlSortArgument } from '../../../../graphql/model/schema/sort/graphql-sort-argument';
import { Specification } from '../../../../graphql/model/schema/specifier/specification';

export abstract class SpecificationModel<TSpecification extends Specification> implements Specification, ModelOnInit {
  protected innerSpec!: TSpecification;

  @ModelProperty({
    key: 'display-name',
    displayName: 'DisplayName',
    type: STRING_PROPERTY.type
  })
  public displayName?: string;

  public modelOnInit(): void {
    this.innerSpec = this.buildInnerSpec();
  }

  public get name(): string {
    return this.innerSpec.name;
  }

  public resultAlias(): string {
    return this.innerSpec.resultAlias();
  }

  public asGraphQlOrderByFragment(): Omit<GraphQlSortArgument, 'direction'> {
    return this.innerSpec.asGraphQlOrderByFragment();
  }

  public asGraphQlSelections(): GraphQlSelection | GraphQlSelection[] {
    return this.innerSpec.asGraphQlSelections();
  }

  // Required to be abstract to support the varying param/return types
  public abstract extractFromServerData(
    ...args: Parameters<TSpecification['extractFromServerData']>
  ): ReturnType<TSpecification['extractFromServerData']>;

  protected abstract buildInnerSpec(): TSpecification;
}
