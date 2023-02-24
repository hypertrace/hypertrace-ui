import { Component, Renderer2 } from '@angular/core';
import { createHostFactory } from '@ngneat/spectator/jest';
import { D3UtilService } from './d3-util.service';
import { TraceD3Selection } from './trace-d3-selection';

describe('D3 util service', () => {
  // Because d3 utils depend on rendering, we need to create a component so we can access its renderer
  const createHost = createHostFactory({
    component: Component({
      selector: 'host-component',
      template: '<ng-content></ng-content>'
    })(class {})
  });

  test('can create selections that support merge', () => {
    const spectator = createHost(`
    <host-component>
      <div class="existing">
      </div>
    </host-component>
    `);
    const service = spectator.inject(D3UtilService);
    const renderer = spectator.inject(Renderer2, true);

    const selection = service
      .select(spectator.element, renderer)
      .selectAll<HTMLDivElement, string>('.existing')
      .data(['first', 'second']);

    const merged = selection.enter().append('div').classed('new', true).merge(selection);

    expect(merged).toBeInstanceOf(TraceD3Selection);
    expect(merged.nodes().length).toBe(2);
    expect(merged.nodes()[0]).toHaveClass('existing');
    expect(merged.nodes()[1]).toHaveClass('new');
  });

  test('can create selections that correctly supper get and set variants', () => {
    const spectator = createHost(`
    <host-component>
      <div test="foo">
      </div>
    </host-component>
    `);
    const service = spectator.inject(D3UtilService);
    const renderer = spectator.inject(Renderer2, true);
    const selection = service.select(spectator.element, renderer).select('[test]');

    expect(selection.attr('test')).toBe('foo');
    // Null should clear and return the selection
    // tslint:disable-next-line: no-null-keyword
    expect(selection.attr('test', null).attr('test')).toBe(null);

    expect(selection.property('foo1', 'bar1').property('foo1')).toBe('bar1');

    expect(selection.text('foo').text()).toBe('foo');
    expect(selection.style('color', 'red').style('color')).toBe('red');
    expect(selection.classed('my-class my-other-class', true).classed('my-other-class')).toBe(true);
    expect(selection.html()).toEqual(expect.any(String));
  });
});
