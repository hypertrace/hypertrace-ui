import { Injectable, Renderer2 } from '@angular/core';
import { DomElementMeasurerService } from '@hypertrace/common';
import { select } from 'd3-selection';
import { D3UtilService } from '../d3/d3-util.service';

@Injectable({ providedIn: 'root' })
export class SvgUtilService {
  private static readonly DEFAULT_DROPSHADOWS: DropshadowDescriptor[] = [
    {
      dx: 0,
      dy: 1,
      blurStdDeviation: 3,
      opacity: 0.5
    },
    {
      dx: 0,
      dy: 3,
      blurStdDeviation: 2,
      opacity: 0.36
    },
    {
      dx: 0,
      dy: 2,
      blurStdDeviation: 2,
      opacity: 0.32
    }
  ];

  public constructor(
    private readonly domElementMeasurerService: DomElementMeasurerService,
    private readonly d3UtilService: D3UtilService
  ) {}

  public addDefinitionDeclarationToSvgIfNotExists(element: SVGGraphicsElement, domRenderer: Renderer2): SVGDefsElement {
    return this.d3UtilService
      .select(this.getParentSvgElement(element), domRenderer)
      .selectAll<SVGDefsElement, unknown>('defs')
      .data([undefined]) // D3 style only create defs if not exist
      .join('defs')
      .node()!;
  }

  public addDropshadowFilterToParentSvgIfNotExists(
    element: SVGGraphicsElement,
    filterId: string,
    domRenderer: Renderer2,
    color: string = 'black'
  ): SVGFilterElement {
    const filter = this.d3UtilService
      .select(this.addDefinitionDeclarationToSvgIfNotExists(element, domRenderer), domRenderer)
      .selectAll<SVGFilterElement, unknown>(`filter#${filterId}`)
      .data([undefined])
      .join('filter')
      .attr('id', filterId);

    filter
      .selectAll('feDropShadow')
      .data(SvgUtilService.DEFAULT_DROPSHADOWS)
      .enter()
      .append('feDropShadow')
      .attr('dx', dropshadow => dropshadow.dx)
      .attr('dy', dropshadow => dropshadow.dy)
      .attr('stdDeviation', dropshadow => dropshadow.blurStdDeviation)
      .attr('flood-color', color)
      .attr('flood-opacity', dropshadow => dropshadow.opacity);

    return filter.node()!;
  }

  public getParentSvgElement(element: SVGGraphicsElement): SVGSVGElement {
    let currElement: Element | null = element;

    while (currElement) {
      if (currElement.tagName === 'svg') {
        return currElement as SVGSVGElement;
      }
      currElement = currElement.parentElement;
    }

    throw Error('No parent SVG tag found for provided element');
  }

  public truncateText(element: SVGTextElement, width: number): void {
    let textLength = this.domElementMeasurerService.getComputedTextLength(element);

    if (textLength <= width) {
      return;
    }

    const originalText = element.textContent!;
    const endIndex = originalText.length;
    const midIndex = Math.floor(originalText.length / 2);
    let previousText = '';

    // Start with empty string and keep adding new char on both side till we exceed the width again
    for (let count = 1; count < midIndex; count++) {
      const currentText = `${originalText.substr(0, count)}...${originalText.substr(endIndex - count)}`;

      element.textContent = currentText;
      textLength = this.domElementMeasurerService.getComputedTextLength(element);

      if (textLength > width) {
        element.textContent = previousText;
        break;
      }

      previousText = currentText;
    }
  }

  /**
   * Wraps text in the given text element so that it doesn't exceed the specified width.
   * If a single word can't be git in the given width then it is truncated.
   *
   * @param element The original SVG Text element that needs to be wrapped
   * @param width The final width of the wrapped text
   */
  public wrapTextIfNeeded(element: SVGTextElement, width: number): void {
    const textLength = this.domElementMeasurerService.getComputedTextLength(element);

    if (textLength <= width) {
      return;
    }

    const appendTSpan = () =>
      textSelection.append('tspan').attr('x', textSelection.attr('x')).attr('y', textSelection.attr('y'));

    const textSelection = select(element);
    const words = textSelection.text().split(' ').reverse();

    let lineNumber = 0;
    textSelection.text('');

    let tspan = appendTSpan().text('');

    let currentLine: string[] = [];
    while (words.length > 0) {
      const word = words.pop()!;
      currentLine.push(word);

      tspan.text(currentLine.join(' '));

      if (this.domElementMeasurerService.getComputedTextLength(tspan.node()!) > width) {
        if (currentLine.length === 1) {
          // Only word is still greater than width. Truncate this text
          this.truncateText(tspan.node()!, width);
        } else {
          // Move this word to next line

          currentLine.pop();
          tspan.text(currentLine.join(' '));
          currentLine = [word];
          tspan = appendTSpan()
            .attr('dy', `${++lineNumber * 1.1}em`)
            .text(word);
        }
      }
    }
  }
}

interface DropshadowDescriptor {
  dx: number;
  dy: number;
  blurStdDeviation: number;
  opacity: number;
}
