import { Injectable } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import { CodeLanguage } from '../code-language';

@Injectable({ providedIn: 'root' })
export class SyntaxHighlighterService {
  public constructor() {
    // Since highlight.js provides support for around 180 languages,
    // Here we're only registering the required languages to reduce the bundle size
    hljs.registerLanguage('yaml', yaml);
    hljs.registerLanguage('json', json);
  }

  public highlight(codeString: string, language: CodeLanguage): string {
    return hljs.highlight(codeString, { language: language }).value;
  }
}
