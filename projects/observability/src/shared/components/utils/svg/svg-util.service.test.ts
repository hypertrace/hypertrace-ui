import { Component } from '@angular/core';
import { DomElementMeasurerService } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { SvgUtilService } from './svg-util.service';

describe('SvgUtilService', () => {
  let spectator: SpectatorHost<unknown>;
  let svgUtilService: SvgUtilService;
  let textElement: SVGTextElement;

  const createHost = createHostFactory({
    component: Component({
      selector: 'test-svg',
      template: `<svg>
      <text x="0" y="0" dominant-baseline="center" text-anchor="middle"></text>
    </svg>`
    })(class {}),
    providers: [
      SvgUtilService,
      mockProvider(DomElementMeasurerService, {
        getComputedTextLength: (element: SVGTextElement) => element.textContent!.length // Not an actual measurement, but it tracks the length
      })
    ]
  });

  beforeEach(() => {
    spectator = createHost('<test-svg></test-svg>');
    svgUtilService = spectator.inject(SvgUtilService);
    textElement = spectator.query('text', { root: true })! as SVGTextElement;
  });

  test('truncate text to less than width by adding ellipsis in the middle', () => {
    textElement.textContent = 'testingthatalongtextcontentwillgettruncated';
    svgUtilService.truncateText(textElement, 20);
    expect(textElement.textContent).toEqual('testingt...runcated');
  });

  test('wrap text', () => {
    const words = ['testing', 'that', 'along', 'textcontent', 'will', 'get', 'wrapped'];
    textElement.textContent = words.join(' ');

    svgUtilService.wrapTextIfNeeded(textElement, 5);
    const tspanElements = textElement.querySelectorAll('tspan');
    expect(tspanElements.length).toEqual(7);

    tspanElements.forEach((tspanElement, index) => {
      expect(tspanElement.textContent).toEqual(words[index]);
    });
  });
});
