import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExternalNavigationParams, ExternalNavigationWindowHandling, NavigationParamsType } from '@hypertrace/common';
import { IconSize } from '../../../../public-api';
import { TableCellRenderer } from '../../table-cell-renderer';
import { TableCellRendererBase } from '../../table-cell-renderer-base';
import { CoreTableCellParserType } from '../../types/core-table-cell-parser-type';
import { CoreTableCellRendererType } from '../../types/core-table-cell-renderer-type';
import { TableCellAlignmentType } from '../../types/table-cell-alignment-type';

@Component({
  selector: 'ht-open-in-new-tab-table-cell-renderer',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-open-in-new-tab
      [showLinkText]="this.getShowLinkText()"
      [linkPrefix]="this.getLinkPrefix()"
      iconSize="${IconSize.ExtraSmall}"
      [paramsOrUrl]="this.getParamsOrUrl()"
      [regexToMatchForHiddenLink]="this?.rendererConfiguration?.regexToMatchForHiddenLink"
      [replacementTextIfRegexMatches]="this?.rendererConfiguration?.replacementTextIfRegexMatches"
      [regexToMatchForWordReplacement]="this?.rendererConfiguration?.regexToMatchForWordReplacement"
      [matchIndexToUseWhenRegexMatches]="this?.rendererConfiguration?.matchIndexToUseWhenRegexMatches"
      [customTextToUseWhenRegexMatches]="this?.rendererConfiguration?.customTextToUseWhenRegexMatches"
    >
    </ht-open-in-new-tab>
  `
})
@TableCellRenderer({
  type: CoreTableCellRendererType.OpenInNewTab,
  alignment: TableCellAlignmentType.Left,
  parser: CoreTableCellParserType.String
})
export class OpenInNewTabCellRendererComponent extends TableCellRendererBase<string> {
  public getShowLinkText(): boolean {
    return this?.rendererConfiguration?.showLinkText || false;
  }

  public getLinkPrefix(): string {
    return this?.rendererConfiguration?.linkPrefix || '';
  }

  public getParamsOrUrl(): ExternalNavigationParams {
    return {
      navType: NavigationParamsType.External,
      url: this.value,
      windowHandling: ExternalNavigationWindowHandling.NewWindow
    };
  }
}
