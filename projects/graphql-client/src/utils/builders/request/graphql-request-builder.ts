import { isEmpty, isEqual, map, merge, mergeWith, toPairs } from 'lodash-es';
import { GraphQlArgument, GraphQlArgumentValue, GraphQlEnumArgument } from '../../../model/graphql-argument';
import { GraphQlSelection } from '../../../model/graphql-selection';

export class GraphQlRequestBuilder {
  private readonly mergedRequest: MergedRequestFragment = {};
  private readonly keyBySelection: WeakMap<GraphQlSelection, string> = new WeakMap();

  public withSelects(...selects: GraphQlSelection[]): this {
    selects.forEach(select => this.addSelect(select));

    return this;
  }

  public build(): string {
    return this.translateMergedRequestToGql(this.mergedRequest);
  }

  public getKeyForSelection(selection: GraphQlSelection): string {
    if (!this.keyBySelection.has(selection)) {
      throw Error('Requested key for unknown selection');
    }

    return this.keyBySelection.get(selection)!;
  }

  private translateMergedRequestToGql(mergedRequest: MergedRequestFragment): string {
    const contents = Object.keys(mergedRequest)
      .map(key => {
        const value = mergedRequest[key];
        const valueAsString = isEmpty(value.childFragment)
          ? ''
          : ` ${this.translateMergedRequestToGql(value.childFragment)}`;
        const keyAsString = this.convertKeyToFieldExpression(key, value);
        const argString = this.convertArgumentMapToString(value.argMap);

        return `${keyAsString}${argString}${valueAsString}`;
      })
      .join(' ');

    return `{ ${contents} }`;
  }

  private addSelect(select: GraphQlSelection): void {
    merge(this.mergedRequest, this.convertSelectToRequestFragment(select, this.mergedRequest));
  }

  private convertSelectToRequestFragment(
    select: GraphQlSelection,
    destinationContainer: MergedRequestFragment
  ): MergedRequestFragment {
    const fieldName = select.path;
    const providedKey = isEmpty(select.alias) ? fieldName : select.alias!;
    const argumentMap = select.arguments ? this.generateArgumentMap(select.arguments) : {};
    const resolvedKey = this.resolveKey(providedKey, fieldName, argumentMap, destinationContainer);
    const missingParentSelection = isEmpty(select.path);

    const childDestinationContainer = missingParentSelection
      ? destinationContainer
      : resolvedKey in destinationContainer
      ? destinationContainer[resolvedKey].childFragment
      : {};

    const mergedChildFragment = (select.children || []).reduce(
      (container, child) => merge(container, this.convertSelectToRequestFragment(child, childDestinationContainer)),
      childDestinationContainer
    );

    if (missingParentSelection) {
      return mergedChildFragment;
    }

    this.keyBySelection.set(select, resolvedKey);

    return {
      [resolvedKey]: {
        argMap: argumentMap,
        fieldName: fieldName,
        childFragment: mergedChildFragment
      }
    };
  }

  private generateArgumentMap(graphQlArgs: GraphQlArgument[]): MergedRequestArgumentMap {
    return graphQlArgs.reduce<MergedRequestArgumentMap>(
      (argMap, nextArg) =>
        mergeWith(
          argMap,
          { [nextArg.name]: nextArg },
          // Modify merge behavior to combine arrays if both are array. Otherwise, use default behavior
          (target, source) => (Array.isArray(target) && Array.isArray(source) ? target.concat(source) : undefined)
        ),
      {}
    );
  }

  private convertArgumentMapToString(argMap: MergedRequestArgumentMap): string {
    if (isEmpty(argMap)) {
      return '';
    }

    const argString = map(argMap, arg => `${arg.name}: ${this.stringifyArgumentValue(arg.value)}`).join(', ');

    return `(${argString})`;
  }

  private stringifyArgumentValue(argumentValue: GraphQlArgumentValue): string {
    if (argumentValue instanceof GraphQlEnumArgument) {
      return argumentValue.toString();
    }

    if (Array.isArray(argumentValue)) {
      const arrayContents = argumentValue
        .map(arrayElementValue => this.stringifyArgumentValue(arrayElementValue))
        .join(', ');

      return `[${arrayContents}]`;
    }

    if (typeof argumentValue === 'object' && !(argumentValue instanceof Date)) {
      const objectContents = toPairs(argumentValue)
        .map(nameValuePair => `${nameValuePair[0]}: ${this.stringifyArgumentValue(nameValuePair[1])}`)
        .join(', ');

      return `{${objectContents}}`;
    }

    return JSON.stringify(argumentValue);
  }

  private convertKeyToFieldExpression(key: string, keyData: MergedRequestKeyData): string {
    return keyData.fieldName === key ? key : `${key}: ${keyData.fieldName}`;
  }

  private areFragmentsMergeable(
    newPath: string,
    newArguments: MergedRequestArgumentMap,
    existingData?: MergedRequestKeyData
  ): boolean {
    return existingData ? newPath === existingData.fieldName && isEqual(newArguments, existingData.argMap) : true;
  }

  private resolveKey(
    providedKey: string,
    providedPath: string,
    providedArgumentMap: MergedRequestArgumentMap,
    destinationContainer: MergedRequestFragment
  ): string {
    let attemptedResolvedKey = this.buildKey(providedKey);
    while (
      !this.areFragmentsMergeable(
        providedPath,
        providedArgumentMap,
        destinationContainer[attemptedResolvedKey.toString()]
      )
    ) {
      attemptedResolvedKey = attemptedResolvedKey.next();
    }

    return attemptedResolvedKey.toString();
  }

  private buildKey(providedKey: string, lastSuffix: number = 0): GeneratedRequestKey {
    return {
      next: () => this.buildKey(providedKey, lastSuffix + 1),
      toString: () => `${providedKey}${lastSuffix === 0 ? '' : lastSuffix}`
    };
  }
}

interface MergedRequestFragment {
  [key: string]: MergedRequestKeyData;
}

interface MergedRequestKeyData {
  argMap: MergedRequestArgumentMap;
  childFragment: MergedRequestFragment;
  fieldName: string;
}

interface MergedRequestArgumentMap {
  [name: string]: GraphQlArgument;
}

interface GeneratedRequestKey {
  toString(): string;
  next(): GeneratedRequestKey;
}
