import { GraphQlSelection } from '../../../model/graphql-selection';
import { GraphQlRequestBuilder } from './graphql-request-builder';

describe('GraphQL Request Builder', () => {
  let builder: GraphQlRequestBuilder;

  beforeEach(() => {
    builder = new GraphQlRequestBuilder();
  });

  test('can build a basic request', () => {
    const requestString = builder
      .withSelects({
        path: 'container',
        children: [{ path: 'firstKey' }, { path: 'secondKey' }]
      })
      .build();

    expect(requestString).toBe('{ container { firstKey secondKey } }');
  });

  test('can combine multiple selects', () => {
    const firstSelect = {
      path: 'first',
      children: [{ path: 'firstA' }, { path: 'firstB' }]
    };

    const secondSelect = {
      path: 'second',
      children: [{ path: 'secondA' }],
      arguments: []
    };

    const thirdSelect = {
      path: 'first',
      children: [{ path: 'firstA' }, { path: 'firstC' }],
      arguments: []
    };

    const requestString = builder.withSelects(firstSelect, secondSelect, thirdSelect).build();

    expect(requestString).toBe('{ first { firstA firstB firstC } second { secondA } }');
  });

  test('can specify all arg types in any position', () => {
    const firstSelect: GraphQlSelection = {
      path: 'my',
      arguments: [{ name: 'arg0', value: 'firstval' }],
      children: [
        {
          path: 'first',
          children: [{ path: 'firstA' }, { path: 'firstB' }],
          arguments: [
            {
              name: 'boolean',
              value: false
            },
            {
              name: 'numeric',
              value: 42
            },
            {
              name: 'date',
              value: new Date('2019-04-06T04:27:30.016Z')
            },
            {
              name: 'array',
              value: [42, ['test'], { key: new Date('2019-04-06T04:27:30.016Z') }]
            },
            {
              name: 'object',
              value: { key: 42, key2: { subkey: 'subkeyval' }, key3: [42] }
            }
          ]
        }
      ]
    };

    const requestString = builder.withSelects(firstSelect).build();

    expect(requestString).toBe(
      '{ my(arg0: "firstval") { first(boolean: false, numeric: 42, date: "2019-04-06T04:27:30.016Z", ' +
        'array: [42, ["test"], {key: "2019-04-06T04:27:30.016Z"}], object: {key: 42, key2: {subkey: "subkeyval"}, ' +
        'key3: [42]}) { firstA firstB } } }'
    );
  });

  test('aliases paths with different arguments', () => {
    const firstSelect: GraphQlSelection = {
      path: 'select',
      children: [
        {
          path: 'other',
          children: [{ path: 'foo' }],
          arguments: [
            {
              name: 'time',
              value: 40
            }
          ]
        }
      ],
      arguments: [
        {
          name: 'filter',
          value: ['first']
        }
      ]
    };

    const secondSelect: GraphQlSelection = {
      path: 'select',
      children: [
        {
          path: 'other',
          children: [{ path: 'bar' }],
          arguments: [
            {
              name: 'time',
              value: 41
            }
          ]
        }
      ],
      arguments: [
        {
          name: 'filter',
          value: ['first']
        }
      ]
    };

    const thirdSelect: GraphQlSelection = {
      path: 'select',
      children: [{ path: 'other' }],
      arguments: [
        {
          name: 'time',
          value: 42
        }
      ]
    };

    const requestString = builder.withSelects(firstSelect, secondSelect, thirdSelect).build();

    expect(requestString).toBe(
      '{ select(filter: ["first"]) { other(time: 40) { foo } other1: other(time: 41) { bar } } select1: select(time: 42) { other } }'
    );
  });

  test('does not inject key if alias separates selections', () => {
    const firstSelect: GraphQlSelection = {
      path: 'select',
      alias: 'firstSelect',
      children: [{ path: 'first' }],
      arguments: [
        {
          name: 'time',
          value: 41
        }
      ]
    };
    const secondSelect: GraphQlSelection = {
      path: 'select',
      children: [{ path: 'second' }],
      arguments: [
        {
          name: 'time',
          value: 42
        }
      ]
    };

    const requestString = builder.withSelects(firstSelect, secondSelect).build();

    expect(requestString).toBe('{ firstSelect: select(time: 41) { first } select(time: 42) { second } }');
  });

  test('supports lookup of any keys, aliased or normal or injected', () => {
    const firstSelect: GraphQlSelection = {
      path: 'select',
      alias: 'firstSelect',
      children: [{ path: 'first' }],
      arguments: [
        {
          name: 'time',
          value: 41
        }
      ]
    };
    const secondSelect: GraphQlSelection = {
      path: 'select',
      children: [{ path: 'second' }],
      arguments: [
        {
          name: 'time',
          value: 42
        }
      ]
    };
    const thirdSelect: GraphQlSelection = {
      path: 'select',
      children: [{ path: 'third' }],
      arguments: [
        {
          name: 'time',
          value: 43
        }
      ]
    };
    const fourthSelect: GraphQlSelection = {
      path: 'select',
      children: [{ path: 'fourth' }],
      arguments: [
        {
          name: 'time',
          value: 44
        }
      ]
    };

    builder.withSelects(firstSelect, secondSelect, thirdSelect, fourthSelect);

    expect(builder.build()).toBe(
      '{ firstSelect: select(time: 41) { first } select(time: 42) { second } select1: select(time: 43) { third } select2: select(time: 44) { fourth } }'
    );

    expect(builder.getKeyForSelection(firstSelect)).toBe('firstSelect');
    expect(builder.getKeyForSelection(secondSelect)).toBe('select');
    expect(builder.getKeyForSelection(thirdSelect)).toBe('select1');
    expect(builder.getKeyForSelection(fourthSelect)).toBe('select2');
  });

  test('supports aliased fields', () => {
    const firstSelect = {
      path: 'foo',
      children: [
        { path: 'baz', alias: 'a' },
        { path: 'baz', alias: 'b' }
      ],
      arguments: []
    };

    const secondSelect = {
      path: 'foo',
      children: [{ path: 'baz', alias: 'c' }, { path: 'baz' }],
      arguments: []
    };

    const requestString = builder.withSelects(firstSelect, secondSelect).build();

    expect(requestString).toBe('{ foo { a: baz b: baz c: baz baz } }');
  });

  test('supports arguments for aliased fields', () => {
    const select = {
      path: 'foo',
      children: [
        {
          path: 'baz',
          alias: 'a',
          arguments: [
            {
              name: 'arg',
              value: 'value'
            }
          ]
        }
      ]
    };

    const requestString = builder.withSelects(select).build();

    expect(requestString).toBe('{ foo { a: baz(arg: "value") } }');
  });

  test('supports an alias that matches another path', () => {
    const aliasedBar = { path: 'bar', alias: 'baz' };
    const plainBaz = { path: 'baz' };
    const select = {
      path: 'foo',
      children: [aliasedBar, plainBaz],
      arguments: []
    };

    const requestString = builder.withSelects(select).build();

    expect(requestString).toBe('{ foo { baz: bar baz1: baz } }');

    expect(builder.getKeyForSelection(aliasedBar)).toBe('baz');

    expect(builder.getKeyForSelection(plainBaz)).toBe('baz1');
  });

  test('combines selections no matter the arrival order', () => {
    const firstSelect = {
      path: 'a',
      arguments: [{ name: 'arg', value: 'foo' }],
      children: [{ path: 'child1' }]
    };
    const secondSelect = {
      path: 'a',
      children: [{ path: 'child2' }]
    };
    const thirdSelect = {
      path: 'a',
      arguments: [{ name: 'arg', value: 'foo' }],
      children: [{ path: 'child3' }]
    };
    const fourthSelect = {
      path: 'a',
      children: [{ path: 'child4' }]
    };

    const requestString = builder.withSelects(firstSelect, secondSelect, thirdSelect, fourthSelect).build();

    expect(requestString).toBe('{ a(arg: "foo") { child1 child3 } a1: a { child2 child4 } }');
  });
});
