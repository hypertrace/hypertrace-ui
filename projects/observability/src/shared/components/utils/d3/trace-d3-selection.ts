import { Renderer2 } from '@angular/core';
import {
  BaseType,
  CustomEventParameters,
  EnterElement,
  Local,
  namespace,
  Selection,
  selection as selectionFunction,
  ValueFn
} from 'd3-selection';
import { Transition } from 'd3-transition';
import { D3UtilService } from './d3-util.service';

// tslint:disable: no-null-keyword wrapping D3 which uses null
export class TraceD3Selection<
  TElement extends BaseType,
  TData = undefined,
  PElement extends BaseType = null,
  PData = undefined
> implements Selection<TElement, TData, PElement, PData> {
  public constructor(
    private readonly renderer: Renderer2,
    private readonly d3Utils: D3UtilService,
    private readonly d3Selection: Selection<TElement, TData, PElement, PData>
  ) {}

  public select(selectorSelect: null): Selection<null, undefined, PElement, PData>;
  public select<DescElement extends BaseType>(
    selectorSelect: string | ValueFn<TElement, TData, DescElement>
  ): Selection<DescElement, TData, PElement, PData>;
  public select<DescElement extends BaseType>(
    selectorSelect: string | null | ValueFn<TElement, TData, DescElement>
  ): Selection<DescElement, TData, PElement, PData> | Selection<null, undefined, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.select<DescElement>(selectorSelect as string));
  }

  public selectAll(selectorSelectAll?: null): Selection<null, undefined, TElement, TData>;
  public selectAll<DescElement extends BaseType, OldDatum>(
    selectorSelectAll: string | ValueFn<TElement, TData, ArrayLike<DescElement>>
  ): Selection<DescElement, OldDatum, TElement, TData>;
  public selectAll<DescElement extends BaseType, OldDatum>(
    selectorSelectAll?: null | string | ValueFn<TElement, TData, ArrayLike<DescElement>>
  ): Selection<DescElement, OldDatum, TElement, TData> | Selection<null, undefined, TElement, TData> {
    return this.valueOrWrappedSelection(this.d3Selection.selectAll<DescElement, OldDatum>(selectorSelectAll as string));
  }

  public attr(name: string): string;
  public attr(
    name: string,
    value: null | string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>
  ): this;
  public attr(
    name: string,
    value?: null | string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>
  ): this | string {
    if (value === undefined) {
      return this.d3Selection.attr(name);
    }

    return this.valueOrThis(this.d3Selection.attr(name, value as string));
  }

  public classed(names: string): boolean;
  public classed(names: string, value: boolean | ValueFn<TElement, TData, boolean>): this;
  public classed(names: string, value?: boolean | ValueFn<TElement, TData, boolean>): this | boolean {
    if (value === undefined) {
      return this.d3Selection.classed(names);
    }

    return this.valueOrThis(this.d3Selection.classed(names, value as boolean));
  }

  public style(name: string): string;
  public style(name: string, value: null): this;
  public style(
    name: string,
    value: string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>,
    priority?: 'important' | null
  ): this;
  public style(
    name: string,
    value?: null | string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>,
    priority?: 'important' | null
  ): string | this {
    if (value === undefined) {
      return this.d3Selection.style(name);
    }

    return this.valueOrThis(this.d3Selection.style(name, value as string, priority));
  }

  public property(name: string): unknown;
  public property<T>(name: Local<T>): T | undefined;
  public property(name: string, value: null | unknown | ValueFn<TElement, TData, unknown | null>): this;
  public property<T>(name: Local<T>, value: T | ValueFn<TElement, TData, T>): this;
  public property(
    name: string | Local<unknown>,
    value?: null | unknown | ValueFn<TElement, TData, unknown>
  ): this | unknown {
    if (value === undefined) {
      return this.d3Selection.property(name as string);
    }

    return this.valueOrThis(this.d3Selection.property(name as string, value));
  }

  public text(): string;
  public text(
    value: null | string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>
  ): this;
  public text(
    value?: null | string | number | boolean | ValueFn<TElement, TData, string | number | boolean | null>
  ): string | this {
    if (value === undefined) {
      return this.d3Selection.text();
    }

    return this.valueOrThis(this.d3Selection.text(value as string));
  }

  public html(): string;
  public html(value: null | string | ValueFn<TElement, TData, string | null>): this;
  public html(value?: null | string | ValueFn<TElement, TData, string | null>): this | string {
    if (value === undefined) {
      return this.d3Selection.html();
    }

    return this.valueOrThis(this.d3Selection.html(value as string));
  }

  public append<ChildElement extends BaseType>(
    type: string | ValueFn<TElement, TData, ChildElement>
  ): Selection<ChildElement, TData, PElement, PData> {
    return this.select((datum, index, group) => {
      const currElement = group[index];
      const newChild = this.buildCreator(type).call(currElement, datum, index, group);
      this.renderer.appendChild(currElement, newChild);

      return newChild;
    });
  }

  public insert<ChildElement extends BaseType>(
    type: string | ValueFn<TElement, TData, ChildElement>,
    before?: string | ValueFn<TElement, TData, BaseType>
  ): Selection<ChildElement, TData, PElement, PData> {
    return this.select((datum, index, group) => {
      const currElement = group[index];
      const newChild = this.buildCreator(type).call(currElement, datum, index, group);
      const beforeChild = before === undefined ? undefined : this.select(before).node();
      this.renderer.insertBefore(currElement, newChild, beforeChild);

      return newChild;
    });
  }

  public remove(): this {
    return this.valueOrThis(this.d3Selection.remove());
  }

  public clone(deep?: boolean): Selection<TElement, TData, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.clone(deep));
  }

  public merge(other: Selection<TElement, TData, PElement, PData>): Selection<TElement, TData, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.merge(this.valueOrUnwrappedSelection(other)));
  }

  public filter<FilteredElement extends BaseType = TElement>(
    selectorFilter: string | ValueFn<TElement, TData, boolean>
  ): Selection<FilteredElement, TData, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.filter<FilteredElement>(selectorFilter as string));
  }

  public sort(comparator?: ((a: TData, b: TData) => number) | undefined): this {
    return this.valueOrThis(this.d3Selection.sort(comparator));
  }

  public order(): this {
    return this.valueOrThis(this.d3Selection.order());
  }

  public raise(): this {
    return this.valueOrThis(this.d3Selection.raise());
  }

  public lower(): this {
    return this.valueOrThis(this.d3Selection.lower());
  }

  public datum(): TData;
  public datum(value: null): Selection<TElement, undefined, PElement, PData>;
  public datum<NewDatum>(
    value: NewDatum | ValueFn<TElement, TData, NewDatum>
  ): Selection<TElement, NewDatum, PElement, PData>;
  public datum<NewDatum>(
    value?: null | NewDatum | ValueFn<TElement, TData, NewDatum>
  ): Selection<TElement, NewDatum, PElement, PData> | TData {
    if (value === undefined) {
      return this.d3Selection.datum();
    }

    return this.valueOrWrappedSelection(this.d3Selection.datum<NewDatum>(value as NewDatum));
  }

  public data(): TData[];
  public data<NewDatum>(
    data: NewDatum[] | ValueFn<PElement, PData, NewDatum[]>,
    key?: ValueFn<TElement | PElement, TData | NewDatum, string> | undefined
  ): Selection<TElement, NewDatum, PElement, PData>;
  public data<NewDatum>(
    data?: NewDatum[] | ValueFn<PElement, PData, NewDatum[]>,
    key?: ValueFn<TElement | PElement, TData | NewDatum, string> | undefined
  ): Selection<TElement, NewDatum, PElement, PData> | TData[] {
    return this.valueOrWrappedSelection(this.d3Selection.data<NewDatum>(data as NewDatum[], key));
  }

  public join<ChildElement extends BaseType, OldDatum = TData>(
    enter:
      | string
      | ((elem: Selection<EnterElement, TData, PElement, PData>) => Selection<ChildElement, TData, PElement, PData>),
    update?: (
      elem: Selection<TElement, TData, PElement, PData>
    ) => Selection<TElement, TData, PElement, PData> | undefined,
    exit?: (elem: Selection<TElement, OldDatum, PElement, PData>) => void
  ): Selection<TElement | ChildElement, TData, PElement, PData> {
    type OnEnterFn = (
      elem: Selection<EnterElement, TData, PElement, PData>
    ) => Selection<ChildElement, TData, PElement, PData>;

    const enterAsFunction =
      typeof enter !== 'string'
        ? enter
        : (selection: Selection<EnterElement, TData, PElement, PData>) => selection.append(enter);

    const wrappedEnter = this.wrapFunction(enterAsFunction);
    const maybeWrappedUpdate = update && this.wrapFunction(update);
    const maybeWrappedExit = exit && this.wrapFunction(exit);

    return this.valueOrWrappedSelection(
      this.d3Selection.join(wrappedEnter as OnEnterFn, maybeWrappedUpdate, maybeWrappedExit)
    );
  }

  public enter(): Selection<EnterElement, TData, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.enter());
  }

  public exit<OldDatum>(): Selection<TElement, OldDatum, PElement, PData> {
    return this.valueOrWrappedSelection(this.d3Selection.exit<OldDatum>());
  }

  public on(typenames: string): ValueFn<TElement, TData, void> | undefined;
  public on(typenames: string, listener: null | ValueFn<TElement, TData, void>, capture?: boolean | undefined): this;
  public on(
    typenames: string,
    listener?: null | ValueFn<TElement, TData, void>,
    capture?: boolean
  ): this | ValueFn<TElement, TData, void> | undefined {
    if (listener === undefined) {
      return this.d3Selection.on(typenames);
    }

    return this.valueOrThis(this.d3Selection.on(typenames, listener as ValueFn<TElement, TData, void>, capture));
  }

  public dispatch(
    type: string,
    parameters?: CustomEventParameters | ValueFn<TElement, TData, CustomEventParameters>
  ): this {
    return this.valueOrThis(
      this.d3Selection.dispatch(type, parameters as ValueFn<TElement, TData, CustomEventParameters>)
    );
  }

  public each(func: ValueFn<TElement, TData, void>): this {
    return this.valueOrThis(this.d3Selection.each(func));
  }
  public call(
    func: (selection: Selection<TElement, TData, PElement, PData>, ...args: unknown[]) => void,
    ...args: unknown[]
  ): this {
    this.d3Selection.call(this.wrapFunction(func), ...args);

    return this;
  }
  public empty(): boolean {
    return this.d3Selection.empty();
  }
  public node(): TElement | null {
    return this.d3Selection.node();
  }
  public nodes(): TElement[] {
    return this.d3Selection.nodes();
  }
  public size(): number {
    return this.d3Selection.size();
  }

  public interrupt(name?: string | undefined): Transition<TElement, TData, PElement, PData> {
    return this.d3Selection.interrupt(name);
  }

  public transition(
    transitionOrName?: string | Transition<BaseType, unknown, BaseType, unknown>
  ): Transition<TElement, TData, PElement, PData> {
    return this.d3Selection.transition(transitionOrName as string);
  }

  private valueOrWrappedSelection<
    T,
    WElement extends BaseType,
    WData = undefined,
    QElement extends BaseType = null,
    QData = undefined
  >(
    value: T | Selection<WElement, WData, QElement, QData>
  ): ValueOrSelection<typeof value, T, WElement, WData, QElement, QData> {
    if (this.isSelection<WElement, WData, QElement, QData>(value)) {
      return new TraceD3Selection(this.renderer, this.d3Utils, value);
    }

    return value as ValueOrSelection<typeof value, T, WElement, WData, QElement, QData>;
  }

  private valueOrUnwrappedSelection<
    T,
    WElement extends BaseType,
    WData = undefined,
    QElement extends BaseType = null,
    QData = undefined
  >(
    value: T | Selection<WElement, WData, QElement, QData>
  ): ValueOrSelection<typeof value, T, WElement, WData, QElement, QData> {
    // Unwrap any returned value (which is going to d3) that are instances of trace selections
    if (value instanceof TraceD3Selection) {
      return value.d3Selection;
    }

    return value as ValueOrSelection<typeof value, T, WElement, WData, QElement, QData>;
  }

  private valueOrThis<T>(
    value: T | Selection<TElement, TData, PElement, PData>
  ): ValueOrSelection<typeof value, T, TElement, TData, PElement, PData, this> {
    if (this.isSelection(value)) {
      return this;
    }

    return value as ValueOrSelection<typeof value, T, TElement, TData, PElement, PData, this>;
  }

  private isSelection<
    WElement extends BaseType,
    WData = undefined,
    QElement extends BaseType = null,
    QData = undefined
  >(value: unknown): value is Selection<WElement, WData, QElement, QData> {
    return value instanceof selectionFunction;
  }

  // tslint:disable-next-line: no-any
  private wrapFunction<TFunction extends (...args: any[]) => unknown>(provided: TFunction): TFunction {
    return ((...args: Parameters<TFunction>) =>
      this.valueOrUnwrappedSelection(
        provided.apply(
          this.d3Selection,
          args.map(arg => this.valueOrWrappedSelection(arg))
        )
      )) as TFunction;
  }

  private buildCreator<ChildElement extends BaseType>(
    maybePrefixedTagOrValueFn: string | ValueFn<TElement, TData, ChildElement>
  ): ValueFn<TElement, TData, ChildElement> {
    if (typeof maybePrefixedTagOrValueFn === 'function') {
      return maybePrefixedTagOrValueFn;
    }
    const localNameOrNamespacedObject = namespace(maybePrefixedTagOrValueFn);
    const creator = (localName: string, maybeNamespace?: string) =>
      this.d3Utils.createDetached<ChildElement>(this.renderer, localName, maybeNamespace);

    return function (this: TElement): ChildElement {
      if (typeof localNameOrNamespacedObject === 'object') {
        return creator(localNameOrNamespacedObject.local, localNameOrNamespacedObject.space);
      }

      // May not be an element, in which case this will be undefined - still OK
      const inheritedNamespace = (this as Partial<Element>).namespaceURI;

      return creator(localNameOrNamespacedObject, inheritedNamespace !== null ? inheritedNamespace : undefined);
    };
  }
}
type ValueOrSelection<
  TParam,
  TValue,
  TElement extends BaseType = BaseType,
  TData = undefined,
  PElement extends BaseType = null,
  PData = undefined,
  TSelection extends Selection<TElement, TData, PElement, PData> = Selection<TElement, TData, PElement, PData>
> = TParam extends Selection<TElement, TData, PElement, PData> ? TSelection : TValue;
