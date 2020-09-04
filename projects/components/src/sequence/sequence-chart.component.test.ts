import { CommonModule } from '@angular/common';
import { createHostFactory } from '@ngneat/spectator/jest';
import { select } from 'd3-selection';
import { LayoutChangeModule } from '../layout/layout-change.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SequenceChartAxisService } from './axis/sequence-chart-axis.service';
import { SequenceChartLayoutService } from './layout/sequence-chart-layout.service';
import { SequenceBarRendererService } from './renderer/sequence-bar-renderer.service';
import { SequenceChartComponent } from './sequence-chart.component';
import { SequenceChartService } from './sequence-chart.service';

describe('Sequence Chart component', () => {
  // NOTE: tests need to query from root because angular abstraction does not support SVG
  const createHost = createHostFactory({
    component: SequenceChartComponent,
    imports: [CommonModule, TooltipModule, LayoutChangeModule],
    providers: [SequenceChartService, SequenceChartAxisService, SequenceChartLayoutService, SequenceBarRendererService]
  });

  test('should render data', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      },
      {
        id: '2',
        start: 1569357461346,
        end: 1569357465346,
        label: 'Segment 2',
        color: 'green'
      },
      {
        id: '3',
        start: 1569357462346,
        end: 1569357465346,
        label: 'Segment 3',
        color: 'green'
      },
      {
        id: '4',
        start: 1569357463346,
        end: 1569357465346,
        label: 'Segment 4',
        color: 'green'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData
      }
    });

    const dataRows = chart.queryAll('.data-row', { root: true });
    expect(dataRows.length).toBe(4);

    dataRows.forEach((dataRow, index) => {
      // Test Backdrop rendering
      const backdropRect = dataRow.querySelector('.backdrop');
      expect(backdropRect).toExist();

      const backdropBorderTop = dataRow.querySelector('.backdrop-border-top');
      expect(backdropBorderTop).toExist();

      const backdropBorderBottom = dataRow.querySelector('.backdrop-border-bottom');
      expect(backdropBorderBottom).toExist();

      // Test Bar value
      const barValueRect = dataRow.querySelector('.bar-value');
      expect(barValueRect).toExist();
      const barValueRectSelection = select(barValueRect);
      expect(barValueRectSelection.style('fill')).toEqual(segmentsData[index].color);
      expect(barValueRectSelection.attr('height')).toEqual('18');
      expect(barValueRectSelection.attr('rx')).toEqual('3');
      expect(barValueRectSelection.attr('ry')).toEqual('3');

      // Test Bar text
      const barValueText = dataRow.querySelector('.bar-value-text');
      expect(barValueText).toExist();
      expect(barValueText).toHaveText(`${segmentsData[index].end - segmentsData[index].start}`);
    });
  });

  test('should render unit', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [unit]="unit"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        unit: 'ms'
      }
    });

    const dataRow = chart.query('.data-row', { root: true });
    expect(dataRow).toExist();

    // Test Bar text
    const barValueText = dataRow!.querySelector('.bar-value-text');
    expect(barValueText).toExist();
    expect(barValueText).toHaveText(`${segmentsData[0].end - segmentsData[0].start}ms`);
  });

  test('should render with correct row height', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [rowHeight]="rowHeight"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        rowHeight: 50
      }
    });

    const dataRow = chart.query('.data-row', { root: true });
    expect(dataRow).toExist();
    expect(dataRow!.getAttribute('height')).toEqual('50');
  });

  test('should render with correct bar height', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [barHeight]="barHeight"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        barHeight: 30
      }
    });

    const dataRow = chart.query('.data-row', { root: true });
    expect(dataRow).toExist();

    const barValueRect = dataRow!.querySelector('.bar-value');
    expect(barValueRect).toExist();
    expect(barValueRect!.getAttribute('height')).toEqual('30');
  });

  test('should render with correct header height', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [headerHeight]="headerHeight"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        headerHeight: 20
      }
    });

    const headerElement = chart.query('.axis-header', { root: true });
    expect(headerElement).toExist();
    expect(headerElement!.getAttribute('height')).toEqual('20');
  });

  test('should hover on correct data row', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      },
      {
        id: '2',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 2',
        color: 'green'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [hovered]="hovered"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        hovered: segmentsData[0]
      }
    });

    const dataRows = chart.queryAll('.data-row', { root: true });
    let hoveredRow = chart.query('.hovered-row', { root: true });
    expect(dataRows.length).toEqual(2);
    expect(hoveredRow).toExist();
    expect(dataRows[0]).toBe(hoveredRow);

    // Trigger mouseenter on second
    chart.dispatchMouseEvent(dataRows[0], 'mouseleave');
    chart.dispatchMouseEvent(dataRows[1], 'mouseenter');
    hoveredRow = chart.query('.hovered-row', { root: true });
    expect(hoveredRow).toExist();
    expect(dataRows[0]).not.toBe(hoveredRow);
    expect(dataRows[1]).toBe(hoveredRow);

    // Trigger mouseenter on second
    chart.dispatchMouseEvent(dataRows[1], 'mouseleave');
    hoveredRow = chart.query('.hovered-row', { root: true });
    expect(hoveredRow).not.toExist();
  });

  test('should select correct data row', () => {
    const segmentsData = [
      {
        id: '1',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 1',
        color: 'blue'
      },
      {
        id: '2',
        start: 1569357460346,
        end: 1569357465346,
        label: 'Segment 2',
        color: 'green'
      }
    ];
    const chart = createHost(`<ht-sequence-chart [data]="data" [selection]="selection"></ht-sequence-chart>`, {
      hostProps: {
        data: segmentsData,
        selection: segmentsData[0]
      }
    });

    let dataRows = chart.queryAll('.data-row', { root: true });
    let selectedRow = chart.query('.selected-row', { root: true });
    expect(dataRows).toExist();
    expect(selectedRow).toExist();
    expect(dataRows[0]).toBe(selectedRow);

    // Click on second
    chart.dispatchFakeEvent(dataRows[1], 'click');

    dataRows = chart.queryAll('.data-row', { root: true });
    selectedRow = chart.query('.selected-row', { root: true });
    expect(selectedRow).toExist();
    expect(dataRows[0]).not.toBe(selectedRow);
    expect(dataRows[1]).toBe(selectedRow);

    // Click on second again
    chart.dispatchFakeEvent(dataRows[1], 'click');

    dataRows = chart.queryAll('.data-row', { root: true });
    selectedRow = chart.query('.selected-row', { root: true });
    expect(selectedRow).not.toExist();
  });
});
