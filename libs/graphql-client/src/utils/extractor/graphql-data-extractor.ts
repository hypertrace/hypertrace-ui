import { isEmpty, merge } from 'lodash-es';
import { GraphQlSelection } from '../../model/graphql-selection';
import { GraphQlRequestBuilder } from '../builders/request/graphql-request-builder';

export class GraphQlDataExtractor {
  public extractAll(
    selectionMap: Map<unknown, GraphQlSelection>,
    requestBuilder: GraphQlRequestBuilder,
    response: { [key: string]: unknown }
  ): Map<unknown, unknown> {
    const selectionEntries = Array.from(selectionMap.entries());

    return new Map(
      selectionEntries.map(([key, selection]) => [key, this.extract(selection, requestBuilder, response)])
    );
  }

  public extract<T>(
    selection: GraphQlSelection,
    requestBuilder: GraphQlRequestBuilder,
    response: { [key: string]: unknown }
  ): T {
    return this.getDataFromObject(
      this.getExpectedResponsePath(selection),
      this.remapSelection(selection, requestBuilder, response)
    ) as T;
  }

  private getDataFromObject<T extends { [key: string]: unknown }, P extends string & keyof T>(
    propertyPath: P,
    response: T | T[]
  ): T[P] | T[P][] {
    if (Array.isArray(response)) {
      // tslint:disable-next-line: no-any
      return response.map(singleResponse => this.getDataFromObject(propertyPath, singleResponse as any));
    }

    return response[propertyPath];
  }

  private remapSelection(
    selection: GraphQlSelection,
    requestBuilder: GraphQlRequestBuilder,
    response: { [key: string]: unknown }
  ): { [key: string]: unknown } {
    const expectedKey = this.getExpectedResponsePath(selection);
    const queriedKey = requestBuilder.getKeyForSelection(selection);

    return {
      [expectedKey]: this.remapSelections(requestBuilder, response[queriedKey], selection.children)
    };
  }

  private remapSelections(
    requestBuilder: GraphQlRequestBuilder,
    response: unknown,
    selections: GraphQlSelection[] = []
  ): unknown {
    const isPrimitiveSelection = selections.length === 0;
    if (isPrimitiveSelection) {
      return response;
    }
    if (Array.isArray(response)) {
      return response.map(single => this.remapSelections(requestBuilder, single, selections));
    }
    if (typeof response === 'object' && response !== null) {
      const mappedSelections = selections.map(selection =>
        this.remapSelection(selection, requestBuilder, response as { [key: string]: unknown })
      );

      return merge({}, ...mappedSelections);
    }

    return response;
  }

  private getExpectedResponsePath(selection: GraphQlSelection): string {
    return isEmpty(selection.alias) ? selection.path : selection.alias!;
  }
}
