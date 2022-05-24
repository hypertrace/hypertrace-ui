// tslint:disable:match-default-export-name
import { Injectable } from '@angular/core';
import HighlightJs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import { CodeLanguage } from '../code-language';

@Injectable({ providedIn: 'root' })
export class SyntaxHighlighterService {
  public constructor() {
    // Since highlight.js provides support for around 180 languages,
    // Here we're only registering the required languages to reduce the bundle size
    HighlightJs.registerLanguage('yaml', yaml);
    HighlightJs.registerLanguage('json', json);
  }

  public highlight(codeString: string, language: CodeLanguage): string {
    return HighlightJs.highlight(codeString, { language: language }).value;
  }
}
